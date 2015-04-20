// -*- js-indent-level: 2 -*-

global.$ = $;
global.user_configs = require('./user-config.json');

var abar = require('my/address_bar');
var folder_view = require('my/folder_view');
var nav_panel = require('my/nav_panel');
var path = require('path');
var gui = require('nw.gui');

$(document).ready(function() {
  var folder = new folder_view.Folder($('#files'));
  var addressbar = new abar.AddressBar($('#addressbar'));

  var open_dir = process.cwd();
  if (process.platform === 'linux') {
    open_dir = process.env.HOME;
  }

  folder.open(open_dir);
  addressbar.set(open_dir);

  folder.on('navigate', function(fpath, mime_type) {
    if (mime_type == 'inode/directory') {
      folder.open(fpath);
      addressbar.set(fpath);
    } else {
      gui.Shell.openItem(fpath);
    }
  });

  addressbar.on('navigate', function(dir) {
    addressbar.set(dir);
    folder.open(dir);
  });

  // TODO move to nav_panel.js
  $('#toggle-view-btn').click(function(event){
    event.preventDefault();
    var files_view = $("#files");
    var toggle_btn_glyph = $("#toggle-view-btn span")

    if (files_view.attr('class').split(/\s+/)
        .some(function(cl) { return cl === "icon-view" })){
      files_view.addClass("list-view").removeClass("icon-view");
      toggle_btn_glyph.addClass("glyphicon-list").removeClass("glyphicon-th-large");
    }else{
      files_view.addClass("icon-view").removeClass("list-view")
      toggle_btn_glyph.addClass("glyphicon-th-large").removeClass("glyphicon-list")
    }
  })

  // Context menu
  // TODO move to separate files and maybe make better interface for menus.
  var ctx_menu_click_callback_stub = function(target, item){
    console.log("CTX Menu: Action [" + item + "] invoked on [" + target + "]");
  }

  var file_ctx_menu = new gui.Menu();
  file_ctx_menu.target = "none";
  ['Open', 'Delete', 'Cut', 'Copy','Properties']
    .forEach(function(item_name){
      file_ctx_menu.append(
        new gui.MenuItem({
          type: "normal",
          label: item_name,
          click: function(){
            ctx_menu_click_callback_stub(file_ctx_menu.target, item_name);
          }
        }))
    });

  folder.on('contextmenu', function(file_element, ev){
    file_ctx_menu.target = file_element.attr('data-path');
    file_ctx_menu.popup(ev.pageX, ev.pageY);
    return false;
  })

  var files_view_ctx_menu = new gui.Menu();
  files_view_ctx_menu.target = "none";
  ['New', 'New Folder', '|', 'Open Terminal', 'Folder Properties']
    .forEach(function(item_name){
      var type = "normal";
      if (item_name === '|'){
        type = "separator"
      };
      files_view_ctx_menu.append(
        new gui.MenuItem({
          type: type,
          label: item_name,
          click: function(){
            ctx_menu_click_callback_stub(files_view_ctx_menu.target, item_name);
          },
        }));
    });

  // can't use "#files" as it serves as delegator for ".file"
  $("#files-view").on('contextmenu', function(ev){
    $("#files").children('.focus').removeClass('focus');
    files_view_ctx_menu.target = "<files view blank>"
    files_view_ctx_menu.popup(ev.pageX, ev.pageY);
    return false;
  })

  ////////////////////////////////////////////////////////////////
  // sidebar with resize event monitored.
  var nav_old_natural_state = "<invalid>"

  $("#sidebar-toggle").click(function(e) {
    e.preventDefault();
    /* if ( ! $("#mainview").hasClass("with-sidebar") ){

       } */
    nav_old_natural_state = "<invalid>"
    $("#mainview").toggleClass("with-sidebar");
  });

  var last_win_size = $(window).width();
  $(window).resize(function(e){
    var cur_win_size = $(window).width();
    // 1. No shaking!
    // 2. Whenever enter small-size, always hiding. Avoid repeated removClass.
    // 3. Try to restore previous state if user has not manually toggled state.

    if (Math.abs(cur_win_size - last_win_size) > 10){
      if ( (cur_win_size < 768)
           && (cur_win_size < last_win_size)
           && $("#mainview").hasClass("with-sidebar")){
        $("#mainview").removeClass("with-sidebar")
        // Only store a natural state if shrinking-auto-hiding is activated.
        // Become invalid, whenever manual toggle happens and a restoring happens.
        nav_old_natural_state = "with-sidebar"
      }

      if ( cur_win_size > 768
           && (cur_win_size > last_win_size)
           && nav_old_natural_state === "with-sidebar"){
        $("#mainview").addClass("with-sidebar")
        nav_old_natural_state = "<invalid>"
      }
    }

    last_win_size = cur_win_size;
  })
});

