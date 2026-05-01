# Terraform configuration for SentinelForge AWS Infrastructure
# Provisions EKS (Kubernetes), MSK (Managed Kafka), and RDS (PostGIS)

provider "aws" {
  region = var.aws_region
}

# 1. Managed Streaming for Apache Kafka (MSK)
# Replaces the basic Kafka StatefulSet for production resilience
resource "aws_msk_cluster" "sentinelforge_kafka" {
  cluster_name           = "sentinelforge-edge-telemetry"
  kafka_version          = "3.4.0"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = var.private_subnets
    security_groups = [aws_security_group.kafka_sg.id]
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  tags = {
    Environment = "production"
    Project     = "SentinelForge"
  }
}

# 2. Relational Database Service (RDS) for PostGIS
resource "aws_db_instance" "catalog_db" {
  identifier           = "sentinelforge-catalog"
  allocated_storage    = 100
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = "db.r6g.large"
  db_name              = "catalog"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  publicly_accessible  = false
  vpc_security_group_ids = [aws_security_group.db_sg.id]
}

# 3. Elastic Kubernetes Service (EKS) for Cloud Fusion Microservices
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "sentinelforge-fusion-cluster"
  cluster_version = "1.27"

  vpc_id                   = var.vpc_id
  subnet_ids               = var.private_subnets
  control_plane_subnet_ids = var.private_subnets

  eks_managed_node_groups = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 10

      instance_types = ["t3.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
    # GPU nodes for cloud-side inference fallback
    gpu_inference = {
      desired_size = 1
      min_size     = 0
      max_size     = 3

      instance_types = ["g4dn.xlarge"]
      ami_type       = "AL2_x86_64_GPU"
    }
  }
}
