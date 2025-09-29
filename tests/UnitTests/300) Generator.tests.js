'use strict';

const ASSERT = require( 'assert' );
const FS = require( 'fs' );
const PATH = require( 'path' );

const ServerConfig = require( './ServerConfig' );
var Server = require( '../../src/Server/Server' )( ServerConfig );


describe( 'Generator', function () 
{
	let Generator;

	//---------------------------------------------------------------------
	before( 'Startup',
		async function ()
		{
			await Server.StartupServer();
			return;
		} );


	//---------------------------------------------------------------------
	after( 'Shutdown',
		async function ()
		{
			// await new Promise( resolve => setTimeout( resolve, 1000 ) ); // Wait for sequelize transactions to complete!
			await Server.ShutdownServer();
			return;
		} );


	//---------------------------------------------------------------------
	beforeEach( function () 
	{
		Generator = Server.Utilities.NewGenerator();
	} );


	//---------------------------------------------------------------------
	describe( 'Clear', function ()
	{
		it( 'should clear the buffer and reset indent', function ()
		{
			Generator.WriteNew( 'test' );
			Generator.Indent();
			Generator.Clear();

			ASSERT.strictEqual( Generator.GetBuffer(), '' );
			ASSERT.strictEqual( Generator._indent, 0 );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'GetBuffer', function ()
	{
		it( 'should return empty string initially', function ()
		{
			ASSERT.strictEqual( Generator.GetBuffer(), '' );
		} );

		it( 'should return buffer contents', function ()
		{
			Generator._buffer = 'test content';
			ASSERT.strictEqual( Generator.GetBuffer(), 'test content' );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'Indent', function ()
	{
		it( 'should increment indent level', function ()
		{
			const initialIndent = Generator._indent;
			Generator.Indent();
			ASSERT.strictEqual( Generator._indent, initialIndent + 1 );
		} );

		it( 'should increment multiple times', function ()
		{
			Generator.Indent();
			Generator.Indent();
			Generator.Indent();
			ASSERT.strictEqual( Generator._indent, 3 );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'Unindent', function ()
	{
		it( 'should decrement indent level', function ()
		{
			Generator.Indent();
			Generator.Indent();
			Generator.Unindent();
			ASSERT.strictEqual( Generator._indent, 1 );
		} );

		it( 'should handle zero indent level', function ()
		{
			Generator.Unindent();
			ASSERT.strictEqual( Generator._indent, -1 );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'IndentThis', function ()
	{
		it( 'should temporarily increase indent during callback', function ()
		{
			let indentDuringCallback;
			const initialIndent = Generator._indent;

			Generator.IndentThis( function ()
			{
				indentDuringCallback = Generator._indent;
			} );

			ASSERT.strictEqual( indentDuringCallback, initialIndent + 1 );
			ASSERT.strictEqual( Generator._indent, initialIndent );
		} );

		it( 'should execute callback and restore indent even if callback throws', function ()
		{
			const initialIndent = Generator._indent;

			try
			{
				Generator.IndentThis( function ()
				{
					throw new Error( 'test error' );
				} );
			} catch ( error )
			{
				// Expected to throw
			}

			// Indent should still be restored even after exception
			ASSERT.strictEqual( Generator._indent, initialIndent );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'NewLine', function ()
	{
		it( 'should add newline to buffer', function ()
		{
			Generator.NewLine();
			ASSERT.strictEqual( Generator.GetBuffer(), '\n' );
		} );

		it( 'should add multiple newlines', function ()
		{
			Generator.NewLine();
			Generator.NewLine();
			ASSERT.strictEqual( Generator.GetBuffer(), '\n\n' );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'WriteNew', function ()
	{
		it( 'should write text with no indentation', function ()
		{
			Generator.WriteNew( 'hello' );
			ASSERT.strictEqual( Generator.GetBuffer(), 'hello' );
		} );

		it( 'should write text with proper indentation', function ()
		{
			Generator.Indent();
			Generator.Indent();
			Generator.WriteNew( 'hello' );
			ASSERT.strictEqual( Generator.GetBuffer(), '\t\thello' );
		} );

		it( 'should handle empty text', function ()
		{
			Generator.Indent();
			Generator.WriteNew( '' );
			ASSERT.strictEqual( Generator.GetBuffer(), '\t' );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'WriteAppend', function ()
	{
		it( 'should append text without indentation', function ()
		{
			Generator.WriteNew( 'hello' );
			Generator.WriteAppend( ' world' );
			ASSERT.strictEqual( Generator.GetBuffer(), 'hello world' );
		} );

		it( 'should append to empty buffer', function ()
		{
			Generator.WriteAppend( 'test' );
			ASSERT.strictEqual( Generator.GetBuffer(), 'test' );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'WriteLine', function ()
	{
		it( 'should write text with newline', function ()
		{
			Generator.WriteLine( 'hello' );
			ASSERT.strictEqual( Generator.GetBuffer(), 'hello\n' );
		} );

		it( 'should write with proper indentation and newline', function ()
		{
			Generator.Indent();
			Generator.WriteLine( 'hello' );
			ASSERT.strictEqual( Generator.GetBuffer(), '\thello\n' );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'SaveToFile', function ()
	{
		const testFilename = PATH.join( __dirname, 'test_output.txt' );

		afterEach( function ()
		{
			try
			{
				FS.unlinkSync( testFilename );
			} catch ( error )
			{
				// Ignore if file doesn't exist
			}
		} );

		it( 'should save buffer content to file', function ()
		{
			Generator.WriteNew( 'test content' );
			Generator.SaveToFile( testFilename );

			const fileContent = FS.readFileSync( testFilename, 'utf8' );
			ASSERT.strictEqual( fileContent, 'test content' );
		} );

		it( 'should save empty buffer to file', function ()
		{
			Generator.SaveToFile( testFilename );

			const fileContent = FS.readFileSync( testFilename, 'utf8' );
			ASSERT.strictEqual( fileContent, '' );
		} );

		it( 'should overwrite existing file', function ()
		{
			FS.writeFileSync( testFilename, 'old content' );

			Generator.WriteNew( 'new content' );
			Generator.SaveToFile( testFilename );

			const fileContent = FS.readFileSync( testFilename, 'utf8' );
			ASSERT.strictEqual( fileContent, 'new content' );
		} );
	} );

	//---------------------------------------------------------------------
	describe( 'Integration Tests', function ()
	{
		it( 'should generate properly formatted code', function ()
		{
			Generator.WriteLine( 'function test() {' );
			Generator.IndentThis( function ()
			{
				Generator.WriteLine( 'var x = 1;' );
				Generator.WriteLine( 'if (x > 0) {' );
				Generator.IndentThis( function ()
				{
					Generator.WriteLine( 'console.log("positive");' );
				} );
				Generator.WriteLine( '}' );
			} );
			Generator.WriteLine( '}' );

			const expected = 'function test() {\n\tvar x = 1;\n\tif (x > 0) {\n\t\tconsole.log("positive");\n\t}\n}\n';
			ASSERT.strictEqual( Generator.GetBuffer(), expected );
		} );

		it( 'should handle complex indentation patterns', function ()
		{
			Generator.WriteNew( 'start' );
			Generator.Indent();
			Generator.WriteAppend( ' level1' );
			Generator.NewLine();
			Generator.WriteLine( 'line1' );
			Generator.Indent();
			Generator.WriteLine( 'line2' );
			Generator.Unindent();
			Generator.WriteLine( 'line3' );

			const expected = 'start level1\n\tline1\n\t\tline2\n\tline3\n';
			ASSERT.strictEqual( Generator.GetBuffer(), expected );
		} );
	} );
} );