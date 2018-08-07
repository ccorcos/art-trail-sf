import * as fs from "fs-extra"
import * as papaparse from "papaparse"
import * as path from "path"

interface ParseResult {
	Lat: string
	Long: string
	Title: string
	Artist: string
	Year: string
	"Image URL": string
}

function ktmlDocument(body: string) {
	return `
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
	${body}
</Document>
</kml>
	`.trim()
}

function kmlPlacemark(item: ParseResult) {
	return `
<Placemark>
<name>${item.Title}</name>
<description>
<![CDATA[
<p>${item.Artist} ${item.Year}</p>
<img src="${item["Image URL"]}">
]]>
</description>
<Point>
<coordinates>${item.Long},${item.Lat},0</coordinates>
</Point>
</Placemark>`.trim()
}

;[
	"/Users/chet/Code/js/art-trail/kml-macos",
	"/snapshot/art-trail/kml.js",
	"hey",
]

async function main() {
	const [arg] = process.argv.slice(2)
	if (!arg || arg === "help" || arg === "-h" || arg === "--help") {
		console.log(
			[
				`Usage: kml <file>`,
				`This program expects a csv file with the following columns labeled in the`,
				`first row in any order:`,
				`"Lat", "Long", "Title", "Artist", "Year", "Image URL"`,
			].join("\n")
		)
		return
	}

	const text = await fs.readFile(arg, "utf8")
	const result = papaparse.parse(text, { header: true })
	const data = result.data as Array<ParseResult>
	const kml = ktmlDocument(data.map(kmlPlacemark).join("\n"))
	const fileOut = "./" + path.parse(arg).name + ".kml"
	await fs.writeFile(fileOut, kml, "utf8")
	console.log("created file:", path.resolve(fileOut))
}

main()
