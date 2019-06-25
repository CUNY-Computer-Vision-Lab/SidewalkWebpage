//changes timestamps from UTC to local time. Updates any data order variables for tables.
$(window).load(function () {
        $(".timestamp").each(function(){
        if($(this).hasClass('local')){
            return;
        }
        $(this).addClass('local');

        var timestampText = this.textContent;

        //add sorting attribute, if it's part of a table it will be sorted by this instead of the nicely formatted timestamp.
        $(this).attr("data-order", timestampText);
        
        var localDate = moment(new Date(timestampText + " UTC"));

        var format = 'MMMM Do YYYY, h:mm:ss'
        if($(this).hasClass('date')){
            format = 'MMMM Do YYYY';            
        }
        
        //if the date cannot be parsed, ignore it and leave the text as-is. Otherwise, parse into local datetime format. 
        if(localDate.format(format) !== "Invalid date"){
            this.textContent = localDate.format(format);
        }
    });
});