import  {BlobServiceClient}  from "@azure/storage-blob"

const blobServiceClient = BlobServiceClient.fromConnectionString(
  "DefaultEndpointsProtocol=https;AccountName=fahadtorg;AccountKey=fEMmu2yIHwvFS6fXIIQ0Wc+aF8jcMD+BVsIOVk1ngzunUei15auf3xxiVcNej1dA3jBDf2PxMUpu+AStXiZhdg==;EndpointSuffix=core.windows.net"
);

const containerName = "api-arabic";
const containerClient = blobServiceClient.getContainerClient(containerName);

const createContainerIfNotExists = async () => {
  const containerExists = await containerClient.exists();
  if (!containerExists) {
    await containerClient.create();
    console.log(`The container "${containerName}" has been created`);
  }
};

export {createContainerIfNotExists, containerClient};
