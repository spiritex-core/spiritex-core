'use strict';

const FS = require( 'fs' );


module.exports = function ()
{

	//---------------------------------------------------------------------
	var Generator = {
		_buffer: '',
		_indent: 0,
	};


	//---------------------------------------------------------------------
	Generator.Clear = function ()
	{
		this._buffer = '';
		this._indent = 0;
		return;
	};


	//---------------------------------------------------------------------
	Generator.GetBuffer = function ()
	{
		return this._buffer;
	};


	//---------------------------------------------------------------------
	Generator.Indent = function ()
	{
		this._indent++;
		return;
	};


	//---------------------------------------------------------------------
	Generator.Unindent = function ()
	{
		this._indent--;
		return;
	};


	//---------------------------------------------------------------------
	Generator.IndentThis = function ( Callback )
	{
		this._indent++;
		try
		{
			Callback();
		}
		catch ( error )
		{
			throw error;
		}
		finally
		{
			this._indent--;
		}
		return;
	};


	//---------------------------------------------------------------------
	Generator.NewLine = function ()
	{
		this._buffer += '\n';
		return;
	};


	//---------------------------------------------------------------------
	Generator.WriteNew = function ( Text )
	{
		for ( var i = 0; i < this._indent; i++ ) { this._buffer += '\t'; }
		this._buffer += Text;
		return;
	};


	//---------------------------------------------------------------------
	Generator.WriteAppend = function ( Text )
	{
		this._buffer += Text;
		return;
	};


	//---------------------------------------------------------------------
	Generator.WriteLine = function ( Text )
	{
		this.WriteNew( Text );
		this.NewLine();
		return;
	};


	//---------------------------------------------------------------------
	Generator.SaveToFile = function ( Filename )
	{
		FS.writeFileSync( Filename, this._buffer );
		return;
	};


	//---------------------------------------------------------------------
	return Generator;
};
