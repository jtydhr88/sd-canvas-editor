(function () {
    if (!globalThis.canvasEditor) globalThis.canvasEditor = {};
    const canvasEditor = globalThis.canvasEditor;

    function load(cont) {
        const scripts = cont.textContent.trim().split('\n');
        const base_path = `/file=${scripts.shift()}/js`;
        cont.textContent = '';

        const df = document.createDocumentFragment();
        for (let src of scripts) {
            const script = document.createElement('script');
            script.async = true;
            script.type = 'module';
            script.src = `file=${src}`;
            df.appendChild(script);
        }

        globalThis.canvasEditor.import = async () => {
            const polotno = await import(`${base_path}/polotno.bundle.js`);

            return { polotno };
        };

        if (!globalThis.canvasEditor.imports) {
            globalThis.canvasEditor.imports = {};
        }

        if (!globalThis.canvasEditor.imports.polotno) {
            globalThis.canvasEditor.imports.polotno = async () => await import(`${base_path}/polotno.bundle.js`);
        }

        cont.appendChild(df);


    }

    onUiLoaded(function () {
        canvasEditorImport = gradioApp().querySelector('#canvas-editor-import');
        load(canvasEditorImport);
    });
})();