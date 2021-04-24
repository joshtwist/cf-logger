export const HTML = `<html>
<body>
  <h1>Log Tailer!</h1>
  <input type="text" id="topicId_input">
  <button id="tail_button">Tail</button>
  <div id="output_div"></div>
  <script type="text/javascript">

    let currentWebSocket = null;
    let lastTopicId = null;

    const hostname = window.location.host;
    const topicIdInput = document.getElementById('topicId_input');
    const outputDiv = document.getElementById('output_div');
    const tailButton = document.getElementById('tail_button');
    

    function join(topicId) {
      const ws = new WebSocket(\`wss://\${hostname}/listen/\${topicId}\`);
      let rejoined = false;
      const startTime = Date.now();

      ws.addEventListener("open", event => {
        currentWebSocket = ws;
      });

      ws.addEventListener("message", event => {
        const data = event.data;

        // write output somewhere
        const p = document.createElement("p");
        p.innerText = data;
        outputDiv.appendChild(p);
      });

      ws.addEventListener("close", event => {
        console.log("WebSocket closed, reconnecting:", event.code, event.reason);
        rejoin();
      });

      ws.addEventListener("error", event => {
        console.log("WebSocket  error, reconnecting:", event);
        rejoin();
      });

      const rejoin = async () => {
        if (topicId !== lastTopicId) {
          return;
        }
        if (! rejoined) {
          rejoined = true;
          currentWebSocket = null;

          let timeSinceLastJoin = Date.now() - startTime;
          if (timeSinceLastJoin < 5000) {
            await new Promise(resolve => setTimeout(resolve, 5000 - timeSinceLastJoin));
          }

          join(topicId);
        }
      }
    }

    tailButton.addEventListener("click", event => {
      if (currentWebSocket) {
        currentWebSocket.close();
        currentWebSocket = null;
      }
      const topicId = topicIdInput.value;
      lastTopicId = topicId;
      join(topicId);
    });


      

  </script>

  
</body>
</html>`;
