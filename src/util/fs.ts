import * as fs from "fs"

export async function deleteFolderSync(name: string) {
	if (fs.existsSync(name)) {
		fs.readdirSync(name).forEach((file: string) => {
			const curPath = name + "/" + file
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderSync(curPath)
			} else {
				// delete file
				fs.unlinkSync(curPath)
			}
		})
		fs.rmdirSync(name)
	}
}
