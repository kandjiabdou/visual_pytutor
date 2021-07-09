define([ "require", "jquery", "base/js/namespace", "base/js/events"],
    function( requirejs, $, IPython, events){
    
    // btnvisu is string containing the html element which has the button to python tutor
    var btnvisu = '<div class="bntPythonTutor" title="Python tutor" style=" cursor: pointer; color: #333; position: absolute; top: 30px; left: 20px;"><i class="fa fa-eye"></i><span class="toolbar-btn-label">Python Tutor</span></div>';
    
    // this variable contains the different parameters of the extension
    var params = { add_btn_toobar: true, add_btn_cell: true, server_url: "http://pythontutor.com/" };
    var nb_visualize = Jupyter.notebook.metadata.visualization;

    // this function initializes the buttons and adds one to the notebook menu for the selected cells
    var init = function(){
        // load the parameters
        $.extend(true, params, Jupyter.notebook.config.data['params']);
        // Add the button in the main menu if the associated checkbox is checked in the options of the extension
        if(params.add_btn_toobar){
            $("#maintoolbar-container #run_int.btn-group").append('<button id="current_cell_ToPyTutor" class="btn btn-default" aria-label="Exécuter" title="Visualize on Python Tutor"><i class="fa-eye fa"></i><span class="toolbar-btn-label">Python Tutor</span></button>');            
            $("#current_cell_ToPyTutor").click(function(){
                var cell = Jupyter.notebook.get_selected_cell();
                toPyTutor(cell);
            });
        }
        
        // This loop will go through all the cells and check if we need to add a button or not by calling the function add_btn_to_element()
        var cells = $(".cell");
        cells.each(function() {
            var index = cells.index(this);
            var cell = Jupyter.notebook.get_cell(index);
            var element = $(this).find(".prompt_container");
            // add or not a button the current cell
            add_btn_to_element(cell,element);
        });

        // Add an event to a button for each "code" type cell
        $("body").on("click", ".bntPythonTutor", function(events) {
            // ---- Index de la cellule cliquée : index 
            var index = $(".cell").index($(this).closest(".cell"));
            var cell = Jupyter.notebook.get_cell(index);
            toPyTutor(cell);
        });
    }

    // This function adds a button to an 'element' (div) when certain requirements of the 'cell' are verified
    var add_btn_to_element = function(cell, element) {
        // -------# These are the cases to add a button in next to a cell or not #----------
        // cell code & metadata cell True -----> add the button
        // cell code & metadata cell False -----> Nothing
        // cell code & metadata cell undefined & metadata Notebook True -----> add the button
        // cell code & metadata cell undefined & metadata Notebook False -----> Nothing
        // cell code & metadata cell undefined & metadata Notebook undefined & params.add True -----> add the button
        // cell code & metadata cell undefined & metadata Notebook undefined & params.add False -----> Nothing
        var cell_visualize = cell.metadata.visualization;
        if ( cell.cell_type=="code" && (cell_visualize || (cell_visualize==undefined && nb_visualize) || (cell_visualize==undefined && nb_visualize == undefined && params.add_btn_cell))){
            element.append(btnvisu);
            element.css("margin-bottom"," 20px");
        }
    }
        
    // this function takes a cell as a parameter and opens a tab for visualizing the code of the cell
    var toPyTutor = function(cell){
        // WARNING: Since this fonction can be called with the button in the menu, the cell may be not a code cell. 
        if(cell.cell_type != "code") return;
        // The "cellCode" variable is the text of the cell (the code)
        var codeCell = cell.get_text().trim();
        if(codeCell.length==0){
            alert("Warning the cell is empty!");
            return
        }
        codeCell = fixedEncodeURIComponent(codeCell);
        var url=params.server_url+"iframe-embed.html#code="+codeCell+"&origin=opt-frontend.js&cumulative=false&heapPrimitives=false&textReferences=false&curInstr=0&&verticalStack=false&py=3&rawInputLstJSON=%5B%5D&codeDivWidth=50%25&codeDivHeight=100%25";
        // A new tab is opened on the browser with this url to python tutor
        window.open(url);
    }
        
    // To create the link to python tutor,
    // We need to replace the characters with the HTML URL Coding Reference
    // The function allows fixedEncodeURIComponent() allows to do this
    function fixedEncodeURIComponent (str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }

    // this function is called when a cell is created or changed type and its event will update all the buttons of code type cells
    var on_changeType_or_create_cell = function() {
        events.on('create.Cell', function(event, data) {
            // This function updates all buttons when an event occurs such as cell addition and cell type change
            var element = data.cell.element.find(".prompt_container");
            // When changing type, the cell takes a little time to recreate.
            // So we use an setTimeout() and wait for the end of its creation before calling the add_btn_to_element() function,
            // from there we can access the metadata of the cell.
            setTimeout(function(){add_btn_to_element(data.cell, element);},0);
        });
    }

    // This function will be called by the notebook when the nbextension needs to be loaded.
    // It will load the notebook and extension's parameters before initializing the button and events
    var load_ipython_extension = function() {
        init();
        on_changeType_or_create_cell();
        console.log("Visual Python is ready to be used");
    }
    
    return {load_ipython_extension: load_ipython_extension};
});