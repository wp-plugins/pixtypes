(function ($) {
	/**
	 * Global variables
	 */
	var media = wp.media,
		Attachment = media.model.Attachment,
		serialize_intention = false,
		serialize_timeout = false;

	$(document).ready(function () {

		var $pix_builder = $('#pix_builder'),
			gridster = $(".gridster > ul"),
			modal_container = $('.pix_builder_editor_modal_container');

		/**
		 * @var gridster_params is an object localized by wordpress and is defined by the theme
		 *
		 * @type {Function}
		 */
		gridster_params.serialize_params = new Function([
				gridster_params.serialize_params[0],
				gridster_params.serialize_params[1]
			],
			gridster_params.serialize_params[2]);

		gridster_params.resize.resize = new Function(
				gridster_params.on_resize_callback[0],
				gridster_params.on_resize_callback[1],
				gridster_params.on_resize_callback[2],

			gridster_params.on_resize_callback[3]);

		///**
		// * use this to serialize these params
		// * after that echo them in activation.php config
		// */
		// var gridster_params = {
		// 	widget_margins: [30, 30],
		// 	widget_base_dimensions: [150, 100],
		// 	min_cols: 3,
		// 	max_cols: 6,
		// 	autogenerate_stylesheet: true,
		// 	resize: {
		// 		enabled: true,
		// 		axes: ['x'],
		//		resize: function (el, ui, $widget) {
		//			var size_x = this.resize_wgd.size_x;
		//			if ( size_x == 5 ) {
		//				// get the closest widget size
		//				var cws = this.resize_last_sizex;
		//				// force the widget size to 6
		//				$(this.resize_wgd.el).attr('data-sizex', cws);
		//				this.resize_wgd.size_x = cws;
		//				// now the widget preview
		//				var preview = $(this.resize_wgd.el).find('.preview-holder');
		//				preview.attr('data-sizex', cws);
		//				this.$resize_preview_holder.attr('data-sizex', cws);
		//				$(document).trigger('pix_builder:serialize');
		//		}
		// 	},
		// 	draggable: {
		// 		handle: '.drag_handler'
		// 	},
		// 	serialize_params: function ($w, wgd) {
		// 		var type = $w.data("type"),
		// 			content = $w.find(".block_content").text();
		// 		if (type == "text") {
		// 			content = $w.find(".block_content textarea").val();
		// 		} else if (type == "image") {
		// 			content = $w.find(".open_media").attr("data-attachment_id");
		// 		} else if (type == "editor") {
		// 			content = $w.find(".to_send").text();
		// 		}
		// 		return {
		// 			id: $w.prop("id").replace("block_", ""),
		// 			type: type,
		// 			content: content,
		// 			col: wgd.col,
		// 			row: wgd.row,
		// 			size_x: wgd.size_x,
		// 			size_y: wgd.size_y
		// 		};
		// 	}
		// };

		var widget_width = $('#normal-sortables').width() / 6;
		gridster_params.widget_base_dimensions = [ widget_width - 67 , 40];

		gridster = gridster.gridster(gridster_params).data('gridster');

		//Build the gridster if the builder has value
		//var serialized_value = $pix_builder.val();
		//if (serialized_value !== 'undefined' && serialized_value.length !== 0) {
		//	var parsed = JSON.parse(serialized_value);
		//
		//	// sort serialization
		//	parsed = Gridster.sort_by_row_and_col_asc(parsed);
		//
		//	$.each(parsed, function (i, e) {
		//		var template_args = {
		//			id: this.id,
		//			type: this.type,
		//			content: this.content
		//		};
		//		//debugger;
		//		var block_template = get_block_template(template_args);
		//		gridster.add_widget(block_template, this.size_x, this.size_y, this.col, this.row);
		//	});
		//}

		// get the curent number of blocks
		var number_of_blocks = 0;

		if ( $(gridster)[0].$widgets.length > 0 ) {
			number_of_blocks = $(gridster)[0].$widgets.length;
		}

		// Functions
		/**
		 * Checks if a serialisation event is already ongoing
		 * or start one if not
		 */
		var intent_to_serialize = function() {
			if ( ! serialize_intention ) {
				serialize_timeout = setTimeout( serialize_pix_builder_values, 2000);
				serialize_intention = true;
			} else {
				// kill the timout and start a new one
				clearTimeout(serialize_timeout);
				serialize_timeout = setTimeout( serialize_pix_builder_values, 2000);
			}
		};

		var serialize_pix_builder_values = function(){

			var new_values = gridster.serialize();
			// sort_them
			new_values = Gridster.sort_by_row_and_col_asc(new_values);

			var parsed_string = JSON.stringify(new_values);
			$pix_builder.val(parsed_string);
			serialize_intention = false;
		};

		var close_editor_modal = function () {
			modal_container.removeClass('modal_opened').hide();
			set_pix_builder_editor_content('');
			tinyMCE.triggerSave();
		};

		var set_pix_builder_editor_content = function ( content ){

			var this_editor = tinyMCE.get('pix_builder_editor');

			if( typeof this_editor === "undefined" || this_editor === null) { // text editor
				$('#pix_builder_editor').val( content );
				$('#pix_builder_editor').text( content );

			} else { // visual editor
				this_editor.setContent( content.replace(/\n/ig,"<br>") , {format:'text'});
				this_editor.save( { no_events: true } );
			}
		};

		/**
		 * Events
		 */

		$(document).on('mouseup', '.gridster ul li', function (ev) {
			// lets serialize again
			$(document).trigger('pix_builder:serialize');
		});

		// Add blocks
		$(document).on('click', '.add_block', function (ev) {
			ev.preventDefault();

			var type = $(this).val(),
				args = {
					id: parseInt(number_of_blocks) + 1,
					type: type,
					content: ''
				};
			var block_template = get_block_template(args);
			number_of_blocks = parseInt(number_of_blocks) + 1;
			gridster.add_widget(block_template, 2, 2);
			//after we done update the json
			$(document).trigger('pix_builder:serialize');
		});

		// Remove block
		$(document).on('click', '.remove_block', function () {
			gridster.remove_widget($(this).closest('.item'));
			//after we done update the json
			$(document).trigger('pix_builder:serialize');
		});

		// open modal and prepare the editor
		$(document).on('click', '.edit_editor', function (e){

			e.preventDefault();
			var id = $(this).closest('.item').attr('id').replace('block_', '');

			if ( ! modal_container.hasClass('modal_opened') ) {
				modal_container.addClass('modal_opened')
					.show();

				var content = $('#block_'+ id + ' .to_send').val();

				if ( content !== "" ) {
					set_pix_builder_editor_content( content );
				} else {
					set_pix_builder_editor_content( '' );
				}

				// quick stupid fix ... @TODO come back here when you quit smoking
				switchEditors.switchto(document.getElementById('pix_builder_editor-html'));
				switchEditors.switchto(document.getElementById('pix_builder_editor-tmce'));

				modal_container.find('.insert_editor_content').data('block_id', id );
			}
		});

		// close modal
		$(document).on('click', '.close_modal_btn', function (){
			close_editor_modal();
		});

		// get editor's content and preview it
		$(document).on('click', '.insert_editor_content',function(e){
			e.preventDefault();
			tinyMCE.triggerSave();
			var editor = $('#pix_builder_editor'), // the only portfolio's editor
				editor_val = editor.val(),
				to_send = $('#block_'+ $(this).data('block_id') + ' .to_send');

			$(to_send).text( editor_val );

			// preview the new value
			$(to_send).next('.editor_preview').find('.editor_preview_wrapper').html(editor_val.replace(/\n/ig,"<br>"));

			if ( editor_val === '' ) {
				$(to_send).parent().addClass('empty');
			} else {
				$(to_send).parent().removeClass('empty');
			}

			$(document).trigger('pix_builder:serialize');

			close_editor_modal();
		});

		$(document).on('click', '#publishing-action', function(){
			serialize_pix_builder_values();
		});

		// serialize pix_builder values
		$(document).on('pix_builder:serialize', intent_to_serialize );

		$(document).on('click', '.clear-all', function( ev ){

			ev.preventDefault();

			var conf = confirm('Are you sure, sure you want to delete all blocks?');

			if ( conf ) {
				gridster.remove_all_widgets();
				$(document).trigger('pix_builder:serialize');
			}
		});

	}); /* Document.ready */

	// Get the html for the block
	var get_block_template = function (args) {

		if (typeof args !== 'object') {
			return '';
		}

		var content = '',
			controls_content = '';

		// Editor Block
		if (args.type === 'editor') {
			content = '<textarea class="to_send" style="display: none">' + args.content + '</textarea>'+
				'<div class="editor_preview">' +
					'<div class="editor_preview_wrapper">' + args.content.replace(/\n/ig,"<br>") + '</div>' +
				'</div>';
			controls_content = '<a class="edit_editor"><span>Edit</span></a>';

		// Image Block
		} else if (args.type == 'image') {
			// in case of an image the content should hold only an integer which represents the id
			if (!isNaN(args.content) && args.content !== '') {
				var attach = Attachment.get(args.content);
				attach.fetch({
					async: false,
					success: function () {
						content = '<img class="image_preview" src="' + attach.attributes.url + '">';
						controls_content = '<a class="open_media" href="#" class="wp-gallery" data-attachment_id="' + args.content + '"><span>' + l18n_pix_builder.set_image + '</span></a>';
					}
				});
			} else {
				content = '<img class="image_preview">';
				controls_content = '<a class="open_media" href="#" class="wp-gallery" data-attachment_id="' + args.content + '"><span>'+ l18n_pix_builder.set_image +'</pan></a>';
			}
		}

		var empty_class = '';
		if ( args.content === '' ) {
			empty_class = 'empty';
		}

		return '<li id="block_' + args.id + '" class="block-type--' + args.type + ' item" data-type="' + args.type + '">' +
					'<div class="item__controls">' +
						'<ul class="nav nav--controls">' +
							'<li class="edit">'+controls_content+'</li>' +
							'<li class="remove remove_block"><span>Remove</span></li>' +
							'<li class="move drag_handler"></li>' +
						'</ul>' +
					'</div>' +
					'<div class="item__content block_content ' + empty_class + '">' +
						content +
					'</div>' +
				'</li>';

	}; /* get_block_template */

	$(window).load(function () {

		var last_opened_block = {};
		wp.media.controller.PixBuilderSingleImage = wp.media.controller.FeaturedImage.extend({
			defaults: _.defaults({
				id: 'pix_builder_image',
				filterable: 'uploaded',
				multiple: false,
				toolbar: 'pix_builder_image',
				title: l18n_pix_builder.set_image,
				priority: 60,
				syncSelection: false,
				displaySettings:  false
			}, wp.media.controller.Library.prototype.defaults),
			updateSelection: function () {
				var selection = this.get('selection'),
					id = $(last_opened_block).attr('data-attachment_id'),
					attachment;
				if ('' !== id && -1 !== id) {
					attachment = Attachment.get(id);
					attachment.fetch();
				}
				selection.reset(attachment ? [attachment] : []);
			}
		});

		wp.media.PixBuilderSingleImage = {
			frame: function () {
				if (this._frame)
					return this._frame;

				// create our own media iframe
				this.$button = $(this.element);

				this._frame = wp.media({
					id: 'pix_builder_image',
					title: l18n_pix_builder.set_image,
					filterable: 'uploaded',
					library: {type: 'image'}
				});

				this._frame = wp.media({
					state: 'pix_builder_image',
					states: [new wp.media.controller.PixBuilderSingleImage()]
				});
				this._frame.on('toolbar:create:pix_builder_image', function (toolbar) {
					this.createSelectToolbar(toolbar, {
						text: l18n_pix_builder.set_image
					});
				}, this._frame);

				this._frame.state('pix_builder_image').on('select', this.select);

				this.attachment_id = $(last_opened_block).data('attachment_id');

				return this._frame;
			},
			init: function () {
				$(document).on('click', '.open_media', function (e) {
					e.preventDefault();
					wp.media.PixBuilderSingleImage.element = last_opened_block = this;
					wp.media.PixBuilderSingleImage.frame().open();
				});
			},
			select: function () {
				var selected_attach = selection = this.get('selection').single();

				if (typeof selected_attach.id !== 'undefined') {
					$(last_opened_block).attr('data-attachment_id', selected_attach.id);

					$(last_opened_block).parents('.item__controls').siblings('.block_content').removeClass('empty');

					preview_attachment_image(last_opened_block, selected_attach);
					$(document).trigger('pix_builder:serialize');
				}
			}
		};

		$(wp.media.PixBuilderSingleImage.init);

		// Image Block -- Replace Preview
		var preview_attachment_image = function (el, attachment) {
			$(el).closest('.item').find('.image_preview').attr("src" , attachment.attributes.url);
		};

		// just playing
		jQuery('.pix_builder_container').show(1000);


		// Make the control buttons stick on scroll
		 $(".pixbuilder-controls").sticky({topSpacing:50});

	}); /* Window.load */

})(jQuery);

// Sticky Plugin v1.0.0 for jQuery
// =============
// Website: http://labs.anthonygarand.com/sticky
(function(e){var t={topSpacing:0,bottomSpacing:0,className:"is-sticky",wrapperClassName:"sticky-wrapper",center:false,getWidthFrom:"",responsiveWidth:false},n=e(window),r=e(document),i=[],s=n.height(),o=function(){var t=n.scrollTop(),o=r.height(),u=o-s,a=t>u?u-t:0;for(var f=0;f<i.length;f++){var l=i[f],c=l.stickyWrapper.offset().top,h=c-l.topSpacing-a;if(t<=h){if(l.currentTop!==null){l.stickyElement.css("position","").css("top","");l.stickyElement.trigger("sticky-end",[l]).parent().removeClass(l.className);l.currentTop=null}}else{var p=o-l.stickyElement.outerHeight()-l.topSpacing-l.bottomSpacing-t-a;if(p<0){p=p+l.topSpacing}else{p=l.topSpacing}if(l.currentTop!=p){l.stickyElement.css("position","fixed").css("top",p);if(typeof l.getWidthFrom!=="undefined"){l.stickyElement.css("width",e(l.getWidthFrom).width())}l.stickyElement.trigger("sticky-start",[l]).parent().addClass(l.className);l.currentTop=p}}}},u=function(){s=n.height();for(var t=0;t<i.length;t++){var r=i[t];if(typeof r.getWidthFrom!=="undefined"&&r.responsiveWidth===true){r.stickyElement.css("width",e(r.getWidthFrom).width())}}},a={init:function(n){var r=e.extend({},t,n);return this.each(function(){var n=e(this);var s=n.attr("id");var o=s?s+"-"+t.wrapperClassName:t.wrapperClassName;var u=e("<div></div>").attr("id",s+"-sticky-wrapper").addClass(r.wrapperClassName);n.wrapAll(u);if(r.center){n.parent().css({width:n.outerWidth(),marginLeft:"auto",marginRight:"auto"})}if(n.css("float")=="right"){n.css({"float":"none"}).parent().css({"float":"right"})}var a=n.parent();a.css("height",n.outerHeight());i.push({topSpacing:r.topSpacing,bottomSpacing:r.bottomSpacing,stickyElement:n,currentTop:null,stickyWrapper:a,className:r.className,getWidthFrom:r.getWidthFrom,responsiveWidth:r.responsiveWidth})})},update:o,unstick:function(t){return this.each(function(){var t=e(this);var n=-1;for(var r=0;r<i.length;r++){if(i[r].stickyElement.get(0)==t.get(0)){n=r}}if(n!=-1){i.splice(n,1);t.unwrap();t.removeAttr("style")}})}};if(window.addEventListener){window.addEventListener("scroll",o,false);window.addEventListener("resize",u,false)}else if(window.attachEvent){window.attachEvent("onscroll",o);window.attachEvent("onresize",u)}e.fn.sticky=function(t){if(a[t]){return a[t].apply(this,Array.prototype.slice.call(arguments,1))}else if(typeof t==="object"||!t){return a.init.apply(this,arguments)}else{e.error("Method "+t+" does not exist on jQuery.sticky")}};e.fn.unstick=function(t){if(a[t]){return a[t].apply(this,Array.prototype.slice.call(arguments,1))}else if(typeof t==="object"||!t){return a.unstick.apply(this,arguments)}else{e.error("Method "+t+" does not exist on jQuery.sticky")}};e(function(){setTimeout(o,0)})})(jQuery)
