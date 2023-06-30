curl https://github.com/Sparticuz/chromium/releases/download/v114.0.0/chromium-v114.0.0-pack.tar  -L -o chromium-v114.0.0-pack.tar

bucketName="reinvest-chromium-upload-bucket" \
  && aws s3 cp chromium-v114.0.0-pack.tar "s3://${bucketName}/chromium-v114.0.0-pack.tar"  --acl public-read

