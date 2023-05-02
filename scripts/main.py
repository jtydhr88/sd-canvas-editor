import json

import gradio as gr

import modules.scripts as scripts
from modules import script_callbacks
from modules import extensions
import os
from typing import Callable
from modules.shared import opts
from modules import shared

def get_file_paths(folder):
    file_paths = []

    for root, directories, files in os.walk(folder):
        for filename in files:
            file_path = os.path.join(root, filename)
            file_url = 'file=' + file_path.replace('\\', '/')
            file_paths.append({'url': file_url})

    file_paths.reverse()

    return file_paths

def get_img_file_paths(args):
    args = args[2: len(args) - 2]
    args = args.replace("\\", "")

    page_info = json.loads(args)

    page_type = page_info['type']
    page_num = int(page_info['num'])
    page_size = int(page_info['size'])

    path = os.path.dirname(os.path.realpath(__file__))

    path = os.path.dirname(path)

    path = os.path.dirname(path)

    path = os.path.dirname(path)

    if page_type == 'txt2img':
        path = os.path.join(path, "outputs", "txt2img-images")
    elif page_type == 'img2img':
        path = os.path.join(path, "outputs", "img2img-images")

    img_file_paths = get_file_paths(path)

    total_len = len(img_file_paths)

    start = (page_num - 1) * page_size
    end = start + page_size

    if start > total_len:
        return json.dumps("[false]")
    elif end > total_len:
        end = total_len

    img_file_paths = img_file_paths[start: end]

    return json.dumps(img_file_paths)
# 要遍历的文件夹路径

class Script(scripts.Script):
    def __init__(self) -> None:
        super().__init__()

    def title(self):
        return "Canvas Editor"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        send_canvas_editor = gr.Button(value="Send to Canvas Editor")

        send_canvas_editor.click(None, send_canvas_editor, None, _js="sendImageToCanvasEditor")

        return [send_canvas_editor]


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

        try:
            canvas_default_width = opts.canvas_editor_default_width
        except:
            canvas_default_width = "1024"

        try:
            canvas_default_height = opts.canvas_editor_default_height
        except:
            canvas_default_height = "1024"

        gr.HTML(f'<input type="hidden" id="canvas-editor-default_width" value="{canvas_default_width}" />', visible=False)

        gr.HTML(f'<input type="hidden" id="canvas-editor-default_height" value="{canvas_default_height}" />', visible=False)

        gr.HTML(f'<input type="hidden" id="canvas-editor-polotno-api-key" value="{polotno_api_key}" />', visible=False)

        import_id = 'canvas-editor-import'

        gr.HTML(value='\n'.join(js_), elem_id=import_id, visible=False)

        with gr.Group(visible=False):
            sink = gr.HTML(value='', visible=False)  # to suppress error in javascript
            jscall('getImgFilePaths', get_img_file_paths, id, js, sink)

        with gr.Row():
            gr.HTML('<div id="canvas-editor-container"></div>')
        with gr.Row():
            with gr.Accordion("img2img", open=True):
                send_i2i_i2i = gr.Button(value="Send to img2img")
                send_i2i_inpaint = gr.Button(value="Send to inpaint")
            with gr.Accordion("ControlNet", open=True):
                send_t2t_controlnet = gr.Button(value="Send to txt2img")
                send_i2i_controlnet = gr.Button(value="Send to img2img")

                try:
                    control_net_num = opts.control_net_max_models_num
                except:
                    control_net_num = 1

                select_target_index = gr.Dropdown([str(i) for i in range(control_net_num)],
                                                  label="Send to", value="0", interactive=True,
                                                  visible=(control_net_num > 1))

            send_t2t_controlnet.click(None, select_target_index, None, _js="(i) => {sendImageCanvasEditorControlNet('txt2img', i)}")
            send_i2i_controlnet.click(None, select_target_index, None, _js="(i) => {sendImageCanvasEditorControlNet('img2img', i)}")
            send_i2i_i2i.click(None, send_i2i_i2i, None, _js="sendImageCanvasEditor('img2img_img2img')")
            send_i2i_inpaint.click(None, send_i2i_inpaint, None, _js="sendImageCanvasEditor('img2img_inpaint')")


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
    shared.opts.add_option("canvas_editor_default_width", shared.OptionInfo(
        1024, "Canvas Default Width", gr.Slider, {"minimum": 256, "maximum": 2048, "step": 64, "interactive": True},
        section=section))
    shared.opts.add_option("canvas_editor_default_height", shared.OptionInfo(
        1024, "Canvas Default Height", gr.Slider, {"minimum": 256, "maximum": 2048, "step": 64, "interactive": True},
        section=section))

script_callbacks.on_ui_tabs(on_ui_tabs)
script_callbacks.on_ui_settings(on_ui_settings)
