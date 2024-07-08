import os
import zipfile
from pathlib import Path

config_file_path = Path('./src/config.js')
zip_file_path = Path('../dist/frontend.zip')
zip_file_path.unlink(missing_ok=True)
new_config_content = """
export default {
    ws_url: typeof window !== 'undefined' ? `ws://${location.host}/api/` : null,
    // ws_url: "ws://192.168.6.94:8888/api/"
}
"""

with config_file_path.open('w', encoding='utf-8') as file:
    file.write(new_config_content)

dist_dir = zip_file_path.parent
if not dist_dir.exists():
    dist_dir.mkdir(parents=True)


def create_zip(source_dir, zip_file_path, exclude_dirs):
    with zipfile.ZipFile(zip_file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # 排除目录
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                file_path = Path(root) / file
                zipf.write(file_path, file_path.relative_to(source_dir))


create_zip(Path('.'), zip_file_path, ['.next', 'node_modules'])

print(f"打包完成: {zip_file_path}")

new_config_content = """
export default {
    // ws_url: typeof window !== 'undefined' ? `ws://${location.host}/api/` : null,
    ws_url: "ws://192.168.6.94:8888/api/"
}
"""

with config_file_path.open('w', encoding='utf-8') as file:
    file.write(new_config_content)
