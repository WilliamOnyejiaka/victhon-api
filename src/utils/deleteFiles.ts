import fs from 'fs';


export default async function deleteFiles(file: Express.Multer.File[] | Express.Multer.File) {
    if(Array.isArray(file)){
        file.map((item) => {
            fs.unlink(item.path, (err) => {
                if (err) console.error('Failed to delete:', item.path, err);
            });
        })
    }else{
        fs.unlink(file.path, (err) => {
            if (err) console.error('Failed to delete:', file.path, err);
        });
    }
}