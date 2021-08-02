TO start the app

- npm start

### /upload ->POST Method

- `multipart/form-data`
- Fields
- `file` - > upload through postman
- `folderpath` - > The folder path (e.g. /images/folder/) in which the image has to be uploaded. If the folder(s) didn't exist before, a new folder(s) is created.  Default value - `/`
- If same filename exist in path , then it will be override

### /search?folderpath='/home/'&filename='something' -> GET method

- returns list of files
- can be search with `filename` or `foldername` or `combined`

### /deleteFolder?folderpath='/home/' -> Delete Method

- will delete the folder and all entries associated with it
