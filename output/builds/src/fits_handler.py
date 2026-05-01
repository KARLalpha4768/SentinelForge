"""
fits_handler.py - SentinelForge Edge Pipeline
FITS file I/O with WCS header extraction and frame metadata.

FITS (Flexible Image Transport System) is the universal astronomy data format.
Every telescope CCD/CMOS camera outputs FITS files with headers containing:
  - WCS astrometric solution
  - Exposure time, filter, gain, CCD temperature
  - GPS timestamp of shutter open/close

Dependencies:
    pip install astropy  (optional - graceful fallback to raw binary)
"""
import os
import json
import time
import logging
import numpy as np
from dataclasses import dataclass, asdict
from typing import Optional, Tuple
from pathlib import Path

logger = logging.getLogger("sentinelforge.fits")

_ASTROPY_AVAILABLE = False
try:
    from astropy.io import fits as pyfits
    _ASTROPY_AVAILABLE = True
except ImportError:
    pass


@dataclass
class FrameMetadata:
    """Metadata extracted from FITS header or JSON sidecar."""
    frame_id: int
    sensor_id: str
    site_id: str
    timestamp_utc: float
    exposure_sec: float
    filter_name: str = "clear"
    ccd_temp_c: float = -20.0
    gain_e_per_adu: float = 1.0
    read_noise_e: float = 10.0
    bit_depth: int = 16
    width: int = 4096
    height: int = 4096
    wcs_crpix1: float = 0.0
    wcs_crpix2: float = 0.0
    wcs_crval1: float = 0.0
    wcs_crval2: float = 0.0
    wcs_cd1_1: float = 0.0
    wcs_cd1_2: float = 0.0
    wcs_cd2_1: float = 0.0
    wcs_cd2_2: float = 0.0
    wcs_residual_arcsec: float = 0.0
    plate_solved: bool = False
    gps_locked: bool = True


class FITSHandler:
    """Read/write FITS files. Falls back to raw binary + JSON sidecar."""

    def __init__(self, output_dir: str = "data/frames"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._backend = "astropy" if _ASTROPY_AVAILABLE else "raw"

    def read_frame(self, filepath: str) -> Tuple[np.ndarray, FrameMetadata]:
        path = Path(filepath)
        if path.suffix.lower() in ('.fits', '.fit', '.fts'):
            return self._read_fits(path)
        return self._read_raw(path)

    def write_frame(self, data: np.ndarray, meta: FrameMetadata,
                     filename: str = None) -> str:
        if filename is None:
            filename = f"frame_{meta.frame_id:06d}"
        if _ASTROPY_AVAILABLE:
            return self._write_fits(data, meta, filename)
        return self._write_raw(data, meta, filename)

    def _read_fits(self, path: Path) -> Tuple[np.ndarray, FrameMetadata]:
        with pyfits.open(str(path)) as hdul:
            data = hdul[0].data.astype(np.float32)
            h = hdul[0].header
            meta = FrameMetadata(
                frame_id=h.get('FRAMEID', 0),
                sensor_id=h.get('INSTRUME', 'unknown'),
                site_id=h.get('SITEID', 'unknown'),
                timestamp_utc=h.get('UNIXTIME', time.time()),
                exposure_sec=h.get('EXPTIME', 1.0),
                filter_name=h.get('FILTER', 'clear'),
                ccd_temp_c=h.get('CCD-TEMP', -20.0),
                width=data.shape[1], height=data.shape[0],
            )
            if 'CRPIX1' in h:
                meta.wcs_crpix1 = h['CRPIX1']
                meta.wcs_crpix2 = h.get('CRPIX2', 0)
                meta.wcs_crval1 = h.get('CRVAL1', 0)
                meta.wcs_crval2 = h.get('CRVAL2', 0)
                meta.wcs_cd1_1 = h.get('CD1_1', 0)
                meta.wcs_cd1_2 = h.get('CD1_2', 0)
                meta.wcs_cd2_1 = h.get('CD2_1', 0)
                meta.wcs_cd2_2 = h.get('CD2_2', 0)
                meta.plate_solved = True
        return data, meta

    def _write_fits(self, data: np.ndarray, meta: FrameMetadata,
                     filename: str) -> str:
        filepath = self.output_dir / f"{filename}.fits"
        header = pyfits.Header()
        header['FRAMEID'] = meta.frame_id
        header['INSTRUME'] = meta.sensor_id
        header['SITEID'] = meta.site_id
        header['UNIXTIME'] = meta.timestamp_utc
        header['EXPTIME'] = meta.exposure_sec
        header['FILTER'] = meta.filter_name
        header['CCD-TEMP'] = meta.ccd_temp_c
        header['GPSLOCKED'] = meta.gps_locked
        if meta.plate_solved:
            header['CTYPE1'] = 'RA---TAN'
            header['CTYPE2'] = 'DEC--TAN'
            header['CRPIX1'] = meta.wcs_crpix1
            header['CRPIX2'] = meta.wcs_crpix2
            header['CRVAL1'] = meta.wcs_crval1
            header['CRVAL2'] = meta.wcs_crval2
            header['CD1_1'] = meta.wcs_cd1_1
            header['CD1_2'] = meta.wcs_cd1_2
            header['CD2_1'] = meta.wcs_cd2_1
            header['CD2_2'] = meta.wcs_cd2_2
        header['ORIGIN'] = 'SentinelForge'
        hdu = pyfits.PrimaryHDU(data=data.astype(np.uint16), header=header)
        hdu.writeto(str(filepath), overwrite=True)
        return str(filepath)

    def _read_raw(self, path: Path) -> Tuple[np.ndarray, FrameMetadata]:
        json_path = path.with_suffix('.json')
        if json_path.exists():
            with open(json_path) as f:
                meta = FrameMetadata(**json.load(f))
        else:
            meta = FrameMetadata(frame_id=0, sensor_id="unknown",
                                  site_id="unknown", timestamp_utc=time.time(),
                                  exposure_sec=1.0)
        data = np.fromfile(str(path), dtype=np.uint16)
        data = data.reshape(meta.height, meta.width).astype(np.float32)
        return data, meta

    def _write_raw(self, data: np.ndarray, meta: FrameMetadata,
                    filename: str) -> str:
        raw_path = self.output_dir / f"{filename}.raw"
        json_path = self.output_dir / f"{filename}.json"
        data.astype(np.uint16).tofile(str(raw_path))
        with open(json_path, 'w') as f:
            json.dump(asdict(meta), f, indent=2)
        return str(raw_path)


if __name__ == "__main__":
    print("=== FITS Handler Self-Test ===\n")
    print(f"Backend: {'astropy' if _ASTROPY_AVAILABLE else 'raw+JSON'}")
    handler = FITSHandler(output_dir="test_data/fits_test")
    frame = np.random.poisson(100, (512, 512)).astype(np.float32)
    meta = FrameMetadata(
        frame_id=42, sensor_id="varda-01", site_id="CHL-01",
        timestamp_utc=time.time(), exposure_sec=2.0,
        width=512, height=512, wcs_crval1=180.0, wcs_crval2=-30.0,
        wcs_cd1_1=-2.778e-4, wcs_cd2_2=2.778e-4,
        plate_solved=True, gps_locked=True
    )
    path = handler.write_frame(frame, meta)
    print(f"Wrote: {path} ({os.path.getsize(path)/1024:.1f} KB)")
    data_back, meta_back = handler.read_frame(path)
    print(f"Read: {data_back.shape}, sensor={meta_back.sensor_id}")
    print("\n\u2713 FITS handler test passed.")
