export const init = async () => {
  const { bitcoin: { blocks } } = mempoolJS({
    hostname: 'mempool.space'
  });
  const blocksTipHeight = await blocks.getBlocksTipHeight();
  const getBlock = await blocks.getBlocks({ startHeight: blocksTipHeight-10 });
  const date = new Date(getBlock[0].timestamp * 1000);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date);

  const block = { "blockTipHeight": blocksTipHeight, "date": formattedDate };

  // document.getElementById("result").textContent = JSON.stringify(block, undefined, 2);
  return block;
};
// Initialize the API function
// init();