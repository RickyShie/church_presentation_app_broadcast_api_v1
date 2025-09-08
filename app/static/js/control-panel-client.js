function changeLayout(layoutType){
  channel.postMessage({ type: "layout_change",layout_id: layoutType});
}