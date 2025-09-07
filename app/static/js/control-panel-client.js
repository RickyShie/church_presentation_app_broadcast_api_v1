
const channel = new BroadcastChannel("layout_channel");

function changeLayout(layoutType){
  channel.postMessage({ layout_id: layoutType});
}