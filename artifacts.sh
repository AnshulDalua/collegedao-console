#!/bin/bash
echo "Attemping to delete old artifacts" && \
rm -rf src/types/infra && \
echo "Downloading backend types" && \
curl https://utility-alpha.vercel.app/api/backend_types --output src/types/infra.tgz && \
echo "Extracting backend types" && \
tar -xzf src/types/infra.tgz -C src/types/ && \
echo "Renaming folder from dist to infra" && \
mv src/types/dist src/types/infra && \
echo "Reset infra.tgz and replacing back with dummy" && \
rm src/types/infra.tgz && \
rm src/types/infra/prettier.config.d.cts && \
touch src/types/infra.tgz && \
echo "Done!"
