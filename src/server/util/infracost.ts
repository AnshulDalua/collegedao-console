import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";

interface CostComponents {
  name: string;
  unit: string;
  monthlyCost: number;
  monthlyQuantity: number;
  unitPrice: number;
}

export interface Cost {
  currency: string;
  totalHourlyCost: string;
  totalMonthlyCost: string;
  costComponents: CostComponents[];
  gets?: number;
  puts?: number;
}

export async function infracost(
  key: (string | boolean | number)[],
  query: {},
  storage: boolean = false
) {
  const baseUrl = process.env.VERCEL_URL
    ? "https://" + process.env.VERCEL_URL
    : "http://localhost:3000/";

  const data = await wretch(baseUrl + "/api/cost/plan")
    .addon(QueryStringAddon)
    .accept("application/json")
    .json({ query })
    .post()
    .json()
    .then((data) => (data as any).data);

  const costComponents: CostComponents[] = [];

  for (const resource of data.projects[0].breakdown.resources) {
    for (const {
      name,
      unit,
      monthlyCost,
      monthlyQuantity,
      price,
    } of resource.costComponents ?? []) {
      costComponents.push({
        name,
        unit,
        monthlyCost,
        monthlyQuantity,
        unitPrice: price,
      });
    }
    for (const subResource of resource.subresources ?? []) {
      for (const {
        name,
        unit,
        monthlyCost,
        price,
        monthlyQuantity,
      } of subResource.costComponents) {
        costComponents.push({
          name,
          unit,
          monthlyCost,
          monthlyQuantity,
          unitPrice: price,
        });
      }
    }
  }

  let gets = 0;
  let puts = 0;

  if (storage) {
    const addPrice = [
      "Object adds, bucket/object list (class A)",
      "PUT, COPY, POST, LIST requests",
    ];
    const getPrice = [
      "Object gets, bucket/object list (class B)",
      "GET, SELECT, and all other requests",
    ];

    for (const cc of costComponents) {
      if (addPrice.includes(cc.name)) {
        puts = cc.unitPrice;
      } else if (getPrice.includes(cc.name)) {
        gets = cc.unitPrice;
      }
    }
  }

  const cost: Cost = {
    currency: data.currency,
    totalHourlyCost: parseFloat(data.totalHourlyCost).toFixed(2),
    totalMonthlyCost: parseFloat(data.totalMonthlyCost).toFixed(2),
    costComponents: costComponents,
    gets: gets,
    puts: puts,
  };

  return cost;
}

export async function aws_database(
  region: string,
  size: string,
  engine: string,
  multiAZ: boolean
) {
  return infracost(["awsdb", region, size, engine, multiAZ], {
    format_version: "1.2",
    terraform_version: "1.5.3",
    planned_values: {
      root_module: {
        resources: [
          {
            address: "aws_db_instance.database",
            mode: "managed",
            type: "aws_db_instance",
            name: "database",
            provider_name: "registry.terraform.io/hashicorp/aws",
            schema_version: 2,
            values: {
              engine: engine,
              instance_class: size,
              allocated_storage: 20,
              max_allocated_storage: 1000,
              multi_az: multiAZ,
              final_snapshot_identifier: "final-snapshot",
              monitoring_interval: 0,
              publicly_accessible: true,
              skip_final_snapshot: true,
              storage_encrypted: false,
            },
          },
        ],
      },
    },
    configuration: {
      provider_config: {
        aws: {
          name: "aws",
          full_name: "registry.terraform.io/hashicorp/aws",
          expressions: {
            region: {
              constant_value: region,
            },
          },
        },
      },
    },
    timestamp: "2023-07-22T02:16:13Z",
  });
}

export const gcp_database = (region: string, size: string, engine: string) => {
  return infracost(["gcpdb", region, size, engine], {
    format_version: "1.2",
    terraform_version: "1.5.3",
    planned_values: {
      root_module: {
        resources: [
          {
            address: "google_sql_database_instance.instance",
            mode: "managed",
            type: "google_sql_database_instance",
            name: "instance",
            provider_name: "registry.terraform.io/hashicorp/google",
            schema_version: 0,
            values: {
              database_version: engine,
              name: "your-instance-name",
              region: region,
              settings: [
                {
                  authorized_gae_applications: null,
                  database_flags: [],
                  disk_autoresize: true,
                  maintenance_window: [],
                  pricing_plan: "PER_USE",
                  replication_type: "SYNCHRONOUS",
                  tier: size,
                  user_labels: null,
                },
              ],
              timeouts: null,
            },
            sensitive_values: {
              ip_address: [],
              replica_configuration: [],
              server_ca_cert: [],
              settings: [
                {
                  backup_configuration: [],
                  database_flags: [],
                  ip_configuration: [],
                  location_preference: [],
                  maintenance_window: [],
                },
              ],
            },
          },
        ],
      },
    },
    configuration: {
      provider_config: {
        google: {
          name: "google",
          full_name: "registry.terraform.io/hashicorp/google",
          expressions: {
            credentials: { constant_value: "credentials.json" },
            project: { constant_value: "my-project-id" },
            region: { constant_value: region },
            zone: { constant_value: region + "-a" },
          },
        },
      },
    },
    timestamp: "2023-07-22T22:29:04Z",
  });
};

export async function aws_instance(
  region: string,
  size: string,
  storage: string
) {
  return infracost(["awsinstance", region, size, storage], {
    format_version: "1.2",
    terraform_version: "1.5.3",
    planned_values: {
      root_module: {
        resources: [
          {
            address: "aws_instance.example",
            mode: "managed",
            type: "aws_instance",
            name: "example",
            provider_name: "registry.terraform.io/hashicorp/aws",
            schema_version: 1,
            values: {
              instance_type: size,
              root_block_device: [{ volume_size: storage }],
            },
          },
        ],
      },
    },
    configuration: {
      provider_config: {
        aws: {
          name: "aws",
          full_name: "registry.terraform.io/hashicorp/aws",
          expressions: {
            region: {
              constant_value: region,
            },
          },
        },
      },
    },
    timestamp: "2023-07-31T19:39:52Z",
  });
}

export async function gcp_instance(
  region: string,
  size: string,
  image: string,
  storage: string
) {
  return infracost(["gcpinstance", region, size, storage], {
    format_version: "1.2",
    terraform_version: "1.5.3",
    planned_values: {
      root_module: {
        resources: [
          {
            address: "google_compute_address.static",
            mode: "managed",
            type: "google_compute_address",
            name: "static",
            provider_name: "registry.terraform.io/hashicorp/google",
            schema_version: 0,
            values: {
              address_type: "EXTERNAL",
              description: null,
              name: "static",
              network: null,
              prefix_length: null,
              timeouts: null,
            },
            sensitive_values: { users: [] },
          },
          {
            address: "google_compute_instance.instance",
            mode: "managed",
            type: "google_compute_instance",
            name: "instance",
            provider_name: "registry.terraform.io/hashicorp/google",
            schema_version: 6,
            values: {
              advanced_machine_features: [],
              allow_stopping_for_update: null,
              attached_disk: [],
              boot_disk: [
                {
                  auto_delete: true,
                  disk_encryption_key_raw: null,
                  initialize_params: [
                    {
                      image: image,
                      resource_manager_tags: null,
                      size: storage,
                    },
                  ],
                  mode: "READ_WRITE",
                },
              ],
              can_ip_forward: false,
              deletion_protection: false,
              description: null,
              desired_status: null,
              enable_display: null,
              hostname: null,
              labels: null,
              machine_type: size,
              metadata: null,
              metadata_startup_script: null,
              name: "asdasd",
              network_interface: [
                {
                  access_config: [{ public_ptr_domain_name: null }],
                  alias_ip_range: [],
                  ipv6_access_config: [],
                  network: "default",
                  nic_type: null,
                  queue_count: null,
                },
              ],
              network_performance_config: [],
              params: [],
              resource_policies: null,
              scratch_disk: [],
              service_account: [],
              shielded_instance_config: [],
              tags: null,
              timeouts: null,
            },
            sensitive_values: {
              advanced_machine_features: [],
              attached_disk: [],
              boot_disk: [{ initialize_params: [{ labels: {} }] }],
              confidential_instance_config: [],
              guest_accelerator: [],
              network_interface: [
                {
                  access_config: [{}],
                  alias_ip_range: [],
                  ipv6_access_config: [],
                },
              ],
              network_performance_config: [],
              params: [],
              reservation_affinity: [],
              scheduling: [],
              scratch_disk: [],
              service_account: [],
              shielded_instance_config: [],
            },
          },
        ],
      },
    },
    configuration: {
      provider_config: {
        google: {
          name: "google",
          full_name: "registry.terraform.io/hashicorp/google",
          expressions: {
            region: { constant_value: region },
          },
        },
      },
    },
    relevant_attributes: [
      { resource: "google_compute_address.static", attribute: ["address"] },
    ],
    timestamp: "2023-08-01T21:04:47Z",
  });
}

export async function aws_storage(
  region: string,
  acl: string,
  versioning: string
) {
  return infracost(
    ["awsstorage", region, acl, versioning],
    {
      format_version: "1.2",
      terraform_version: "1.5.3",
      planned_values: {
        root_module: {
          resources: [
            {
              address: "aws_s3_bucket.bucket",
              mode: "managed",
              type: "aws_s3_bucket",
              name: "bucket",
              provider_name: "registry.terraform.io/hashicorp/aws",
              schema_version: 0,
              values: {
                acl: acl,
                region: region,
                bucket: "nice",
                force_destroy: false,
                tags: null,
                timeouts: null,
                versioning: [{ enabled: versioning, mfa_delete: false }],
              },
              sensitive_values: {
                cors_rule: [],
                grant: [],
                lifecycle_rule: [],
                logging: [],
                object_lock_configuration: [],
                replication_configuration: [],
                server_side_encryption_configuration: [],
                tags_all: {},
                versioning: [{}],
                website: [],
              },
            },
          ],
        },
      },
      configuration: {
        provider_config: {
          aws: {
            name: "aws",
            full_name: "registry.terraform.io/hashicorp/aws",
            expressions: {
              region: { constant_value: region },
            },
          },
        },
      },
      timestamp: "2023-08-01T22:57:50Z",
    },
    true
  );
}

export async function gcp_storage(
  region: string,
  acl: string,
  versioning: string
) {
  return infracost(
    ["gcpstorage", region, acl, versioning],
    {
      format_version: "1.2",
      terraform_version: "1.5.3",
      planned_values: {
        root_module: {
          resources: [
            {
              address: "google_storage_bucket.bucket",
              mode: "managed",
              type: "google_storage_bucket",
              name: "bucket",
              provider_name: "registry.terraform.io/hashicorp/google",
              schema_version: 0,
              values: {
                autoclass: [],
                cors: [],
                custom_placement_config: [],
                default_event_based_hold: null,
                encryption: [],
                force_destroy: false,
                lifecycle_rule: [],
                location: region,
                logging: [],
                name: "your_bucket_name",
                requester_pays: null,
                retention_policy: [],
                storage_class: "STANDARD",
                timeouts: null,
                versioning: [{ enabled: versioning }],
              },
              sensitive_values: {
                autoclass: [],
                cors: [],
                custom_placement_config: [],
                encryption: [],
                labels: {},
                lifecycle_rule: [],
                logging: [],
                retention_policy: [],
                versioning: [{}],
                website: [],
              },
            },
            {
              address: "google_storage_bucket_acl.bucket_acl",
              mode: "managed",
              type: "google_storage_bucket_acl",
              name: "bucket_acl",
              provider_name: "registry.terraform.io/hashicorp/google",
              schema_version: 0,
              values: {
                bucket: "your_bucket_name",
                default_acl: null,
                predefined_acl: acl,
              },
              sensitive_values: { role_entity: [] },
            },
          ],
        },
      },
      configuration: {
        provider_config: {
          google: {
            name: "google",
            full_name: "registry.terraform.io/hashicorp/google",
            expressions: {
              region: { constant_value: region },
            },
          },
        },
      },
      relevant_attributes: [
        { resource: "google_storage_bucket.bucket", attribute: ["name"] },
      ],
      timestamp: "2023-08-01T23:03:29Z",
    },
    true
  );
}
