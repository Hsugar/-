# -
jquery一些插件

例如分页的用法：
<div class="pagination" id="j-goods-paging"></div> 
 /**
 * [paging 分页]
 * @param  {[Object]} data [包括count总页码和page_size每页显示条目]
 */
function paging(data) {
    if (!data) return;
    $('#j-goods-paging').pagination({
        total: data.count || 0,
        current: self.page,
        row: self.page_size,
        onJump: function (index) {
            self.page = index;
            getGoodsList();
        }
    });
}
