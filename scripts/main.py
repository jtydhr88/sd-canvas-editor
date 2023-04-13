import gradio as gr

import modules.scripts as scripts
from modules import script_callbacks
from modules import extensions
import os
from typing import Callable
from modules.shared import opts
from modules import shared

class Script(scripts.Script):
    def __init__(self) -> None:
        super().__init__()

    def title(self):
        return "Canvas Editor"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        return ()


def wrap_api(fn):
    _r = 0

    def f(*args, **kwargs):
        nonlocal _r
        _r += 1
        v = fn(*args, **kwargs)
        return v, str(_r)

    return f


def js2py(
        name: str,
        id: Callable[[str], str],
        js: Callable[[str], str],
        sink: gr.components.IOComponent,
) -> gr.Textbox:
    v_set = gr.Button(elem_id=id(f'{name}_set'))
    v = gr.Textbox(elem_id=id(name))
    v_sink = gr.Textbox()
    v_set.click(fn=None, _js=js(name), outputs=[v, v_sink])
    v_sink.change(fn=None, _js=js(f'{name}_after'), outputs=[sink])
    return v


def py2js(
        name: str,
        fn: Callable[[], str],
        id: Callable[[str], str],
        js: Callable[[str], str],
        sink: gr.components.IOComponent,
) -> None:
    v_fire = gr.Button(elem_id=id(f'{name}_get'))
    v_sink = gr.Textbox()
    v_sink2 = gr.Textbox()
    v_fire.click(fn=wrap_api(fn), outputs=[v_sink, v_sink2])
    v_sink2.change(fn=None, _js=js(name), inputs=[v_sink], outputs=[sink])


def jscall(
        name: str,
        fn: Callable[[str], str],
        id: Callable[[str], str],
        js: Callable[[str], str],
        sink: gr.components.IOComponent,
) -> None:
    v_args_set = gr.Button(elem_id=id(f'{name}_args_set'))
    v_args = gr.Textbox(elem_id=id(f'{name}_args'))
    v_args_sink = gr.Textbox()
    v_args_set.click(fn=None, _js=js(f'{name}_args'), outputs=[v_args, v_args_sink])
    v_args_sink.change(fn=None, _js=js(f'{name}_args_after'), outputs=[sink])

    v_fire = gr.Button(elem_id=id(f'{name}_get'))
    v_sink = gr.Textbox()
    v_sink2 = gr.Textbox()
    v_fire.click(fn=wrap_api(fn), inputs=[v_args], outputs=[v_sink, v_sink2])
    v_sink2.change(fn=None, _js=js(name), inputs=[v_sink], outputs=[sink])


def on_ui_tabs():
    id = lambda s: f'canvas-editor-{s}'
    js = lambda s: f'globalThis["{id(s)}"]'

    ext = get_self_extension()

    if ext is None:
        return []

    js_ = [f'{x.path}?{os.path.getmtime(x.path)}' for x in ext.list_files('javascript/lazyload', '.js')]
    js_.insert(0, ext.path)

    with gr.Blocks(analytics_enabled=False) as canvas_editor:
        try:
            polotno_api_key = opts.polotno_api_key
        except:
            polotno_api_key = "bHEpG9Rp0Nq9XrLcwFNu"

        gr.HTML(f'<input type="hidden" id="canvas-editor-polotno-api-key" value="{polotno_api_key}" />', visible=False)

        import_id = 'canvas-editor-import'

        gr.HTML(value='\n'.join(js_), elem_id=import_id, visible=False)

        with gr.Row():
            gr.HTML('<div id="canvas-editor-container"></div>')
        with gr.Row():
            send_t2t = gr.Button(value="Send to txt2img")
            send_i2i = gr.Button(value="Send to img2img")

            try:
                control_net_num = opts.control_net_max_models_num
            except:
                control_net_num = 1

            select_target_index = gr.Dropdown([str(i) for i in range(control_net_num)],
                                              label="Send to", value="0", interactive=True,
                                              visible=(control_net_num > 1))

            send_t2t.click(None, select_target_index, None, _js="(i) => {sendImageCanvasEditor('txt2img', i)}")
            send_i2i.click(None, select_target_index, None, _js="(i) => {sendImageCanvasEditor('img2img', i)}")

    return [(canvas_editor, "Canvas Editor", "canvas_editor")]



def get_self_extension():
    if '__file__' in globals():
        filepath = __file__
    else:
        import inspect
        filepath = inspect.getfile(lambda: None)
    for ext in extensions.active():
        if ext.path in filepath:
            return ext

def on_ui_settings():
    section = ('canvas-editor', "Canvas Editor")
    shared.opts.add_option("polotno_api_key", shared.OptionInfo(
        "bHEpG9Rp0Nq9XrLcwFNu", "Polotno API Key", section=section))

script_callbacks.on_ui_tabs(on_ui_tabs)
script_callbacks.on_ui_settings(on_ui_settings)
