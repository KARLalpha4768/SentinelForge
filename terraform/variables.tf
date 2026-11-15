# Variables for SentinelForge Terraform Infrastructure

variable "aws_region" {
  type        = string
  description = "AWS region for infrastructure deployment"
  default     = "us-gov-west-1"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where the infrastructure is deployed"
}

variable "private_subnets" {
  type        = list(string)
  description = "List of private subnet IDs for MSK and EKS"
}

variable "db_username" {
  type        = string
  description = "Master username for RDS PostGIS database"
  default     = "sentinelforge"
}

variable "db_password" {
  type        = string
  description = "Master password for RDS PostGIS database"
  sensitive   = true
  # No default for secrets
}
