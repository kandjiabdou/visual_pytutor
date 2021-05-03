define([
    "require",
    "jquery",
    "base/js/namespace",
    "base/js/events"
], function( requirejs, $, IPython, events){
        
        // btnvisu is string containing the html element which has the button to python tutor
        var btnvisu = '<div class="bntPythonTutor" title="Python tutor" style=" cursor: pointer; color: #333; position: absolute; top: 25px; left: 40px;"><i class="fa fa-eye"></i></div>';
        
        // this will load paarmeter
        var params = { // updated from server's config & nb metadata
            add_btn_toobar: false,
            add_btn_cell: false,
            add_btn_create_select_cell: false,
        };
        Jupyter.notebook.config.loaded.then(
            function update_options_from_config () {
                $.extend(true, params, Jupyter.notebook.config.data);
            }, function (reason) {
                console.warn('error loading config:', reason);
            }).then(function () {
                if (Jupyter.notebook._fully_loaded) {
                    load_ipython_extension();
                }
            }).catch(function (reason) {
                console.error('unhandled error:', reason);
            }
        );

        // this function initializes the buttons and adds one to the notebook menu for the selected cells
        var init = function(){
            if(params.add_btn_toobar){
                $("#maintoolbar-container #run_int.btn-group").append('<button class="btn current_cell_ToPyTutor" aria-label="Exécuter" title="Visualize on Python Tutor" data-jupyter-action="jupyter-notebook:run-cell-and-select-next"><i class="fa-eye fa"></i><span class="toolbar-btn-label">Python Tutor</span></button>');            
                $(".current_cell_ToPyTutor").on("click", function(){
                    var cell = Jupyter.notebook.get_selected_cell();
                    toPyTutor(cell);
                });
            }
            if(params.add_btn_cell){
                $(".code_cell .input .prompt_container").append(btnvisu);
                //$(".prompt_container").css("flex-wrap","wrap");
                addEvent();
            }
        }
        //************************************************************************************************************************ */
        // this function is called when a cell is created and its event will update all the buttons of the code type cells
        var onCreateCell = function() {
            events.on('create.Cell', function(event, data) {updateButton();});
        }

        // this function is called when a cell changes type and its event will update all the buttons of code type cells
        var onChangedCellType = function() {
            events.on('selected_cell_type_changed.Notebook', function(event, data) {updateButton();});
        }

        //************************************************************************************************************************ */
        // This function updates all buttons when an event occurs such as cell addition and cell type change
        var updateButton = function(){
            $(".code_cell .input .prompt_container").each(function() {
                if($(this).find(".bntPythonTutor").length==0){
                    $(this).append($(btnvisu));
                    //$(this).css("flex-wrap","wrap");
                }
            });
        }

        //************************************************************************************************************************ */
        //this function adds an event to a button for each "code" type cell
        var addEvent = function(events) {
            $("body").on("click", ".bntPythonTutor", function(events) {
                // We get all the cells of the notebook in the "cells" variable
                var cells = Jupyter.notebook.get_cells();
                // Then we only retain the cells of type code
                cells = $.map(cells, function(value, key){if(value.cell_type=="code") return value;});
                var index = $(".bntPythonTutor").index( this );
                // the clicked button has the same index in the jquery ".bntPythonTutor" list as its corresponding cell in "cells"
                var cell = cells[index];
                toPyTutor(cell);
            });
        }

        //********************************************************************************************************************** */
        // this function takes a cell as a parameter and returns to python tutor if certain conditions are met
        var toPyTutor = function(cell){
            if(cell == undefined) return;
            // If the cell is of type code and its "visualization" metadata is true or by default is not defined, a "Python tutor" button is added to the cell
            var visualize = cell.metadata.visualization === undefined ? true : cell.metadata.visualization;
            if(cell.cell_type == "code" && visualize) {
                // The "cellCode" variable is the text of the cell (the code)
                var codeCell = cell.get_text().trim();
                if(codeCell.length==0){
                    alert("Warning the cell is empty!");
                    return
                }
                codeCell = fixedEncodeURIComponent(codeCell);
                var url="http://pythontutor.com/iframe-embed.html#code="+codeCell+"&origin=opt-frontend.js&cumulative=false&heapPrimitives=false&textReferences=false&curInstr=0&&verticalStack=false&py=3&rawInputLstJSON=%5B%5D&codeDivWidth=50%25&codeDivHeight=100%25";
                // A new tab is opened on the browser with this url to python tutor
                window.open(url);
            }
        }
        
        //************************************************************************************************************************ */
        // To create the link to python tutor,
        // We need to replace the characters with the HTML URL Coding Reference
        // The function allows fixedEncodeURIComponent() allows to do this
        function fixedEncodeURIComponent (str) {
            return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
            });
        }
        //************************************************************** */

        // This function will be called by the notebook when the nbextension needs to be loaded.
        function load_ipython_extension() {
            init();
            if(params.add_btn_create_select_cell){
                onCreateCell();
                onChangedCellType();
            }
        }
        return {
            load_ipython_extension: load_ipython_extension
        };
    }
);