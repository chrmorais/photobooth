/*global define*/
define(
	[ 'jquery' ],
	function( $ )
	{
		var signals;
		var stream;
		var canvas = document.createElement( 'canvas' );
		var ctx = canvas.getContext( '2d' );
		var video = document.createElement( 'video' );

		var counter = 0;
		var framerate = 1;

		function init( shared )
		{
			signals = shared.signals;
			canvas.width = 640;
			canvas.height = 480;

			if ( hasWebcamAccess() )
			{
				var cam_options = { video: true };

				document.body.appendChild( video );
				video.id = 'cam-video';

				signals['looped'].add( sendCamData );

				navigator.getUserMedia( cam_options, gotCamData, failed );
			}

			else
			{
				console.log( 'unfortunately, i can\'t access your camera.' );
			}
		}

		function gotCamData( media_stream )
		{
			var source;

			if ( window.webkitURL )
			{
				source = window.URL.createObjectURL( media_stream );
			}

			else
			{
				source = media_stream;
			}

			if ( video.mozSrcObject !== undefined )
			{
				video.mozSrcObject = source;
			}

			else
			{
				video.src = source;
			}

			stream = media_stream;

			video.addEventListener( 'loadedmetadata', signals['cam-started'].dispatch );
			video.play();
		}

		function failed( error )
		{
			console.log( 'failed.' );
		}

		function sendCamData()
		{
			if ( stream )
			{
				if ( counter >= framerate )
				{
					counter = 0;

					try {
						ctx.drawImage( video, 0, 0 );

						var data = ctx.getImageData( 0, 0, canvas.width, canvas.height );
						var image = canvas.toDataURL( 'image/png' );

						signals['cam-data'].dispatch( data );
					}

					catch ( error )
					{
						console.log( error );
					}
				}

				else
				{
					counter++;
				}
			}
		}

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/
		function hasWebcamAccess()
		{
			return !! navigator.getUserMedia;
		}

		var cam = { init: init };

		return cam;
	}
);