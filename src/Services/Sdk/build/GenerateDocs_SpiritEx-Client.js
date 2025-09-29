'use strict';

const FS = require( 'fs' );
const PATH = require( 'path' );

( async () =>
{

	//---------------------------------------------------------------------
	// Get markdown file
	var client_path = PATH.resolve( __dirname, '..', 'SpiritExSdk' );
	var md_filename = PATH.join( client_path, `SpiritEx-Client.md` );
	var md_content = FS.readFileSync( md_filename, 'utf8' );
	

	//---------------------------------------------------------------------
	// Convert the markdown to html
	// https://www.npmjs.com/package/showdown
	const SHOWDOWN = require( 'showdown' );
	var converter = new SHOWDOWN.Converter();
	converter.setFlavor( 'github' );
	var html_document = converter.makeHtml( md_content );
	var html_template = FS.readFileSync( PATH.join( __dirname, 'markdown-template.html' ), 'utf8' );
	html_template = html_template.replace( '{{title}}', 'SpiritEx HTTP Client Documentation' );
	html_template = html_template.replace( '{{content}}', html_document );
	var html_filename = PATH.join( client_path, `SpiritEx-Client.html` );
	FS.writeFileSync( html_filename, html_template );
	console.log( `API documentation saved to: ${html_filename}` );

	//---------------------------------------------------------------------
	// Convert the markdown to pdf (md-to-pdf)
	// https://www.npmjs.com/package/md-to-pdf
	var pdf_filename = PATH.join( client_path, `SpiritEx-Client.pdf` );
	const MD_TO_PDF = require( 'md-to-pdf' );
	var pdf = await MD_TO_PDF.mdToPdf( { path: md_filename } );
	FS.writeFileSync( pdf_filename, pdf.content );
	console.log( `API documentation saved to: ${pdf_filename}` );

	//---------------------------------------------------------------------
	console.log( 'Done.' );
	process.exit( 0 );

} )();
