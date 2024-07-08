import os
import zipfile
from pathlib import Path

zip_file_path = Path('../dist/backend.zip')
zip_file_path.unlink(missing_ok=True)

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


create_zip(Path('.'), zip_file_path, ['node_modules'])

print(f"打包完成: {zip_file_path}")
