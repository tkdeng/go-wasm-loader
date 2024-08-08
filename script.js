"use strict";

;(function(){
  if (WebAssembly) {
    // WebAssembly.instantiateStreaming is not currently available in Safari
    if (WebAssembly && !WebAssembly.instantiateStreaming) {
      // polyfill
      WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
      };
    }

    // load go wasm dependency (wasm_exec.js)
    const head = document.head || document.querySelector('head');
    const gowasmImport = 'https://cdn.jsdelivr.net/gh/golang/go/misc/wasm/wasm_exec.min.js';
    if(document.querySelector('script[src="'+gowasmImport+'"]') == null){
      const script = document.createElement('script');
      script.src = gowasmImport;
      head.appendChild(script);
    }

    // listen for scripts with type="wasm/go"
    setInterval(function(){
      document.querySelectorAll('script[type="wasm/go"]:not([gowasmloaded])').forEach(function(elm){
        elm.setAttribute('gowasmloaded', '');

        if(elm.src.startsWith(window.location.origin+'/')){
          const go = new Go();
          WebAssembly.instantiateStreaming(fetch(elm.src), go.importObject).then((result) => {
            go.run(result.instance);
          });
        }
      });
    }, 100);
  }else{
    console.log('WebAssembly is not supported in your browser');
  }
})();
