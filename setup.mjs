export async function setup(ctx) {
  const { NavItem } = await ctx.loadModule('components/NavItem.mjs');
  const { TOTablePage } = await ctx.loadModule('components/TOTablePage.mjs');

  const TABLE_PAGE = "tso:TablePage";

  ctx.onInterfaceReady(() => {
    const btnEle = ui.create(NavItem({ page: TABLE_PAGE, title: 'Grid', faIcon: 'fa-th' }), document.getElementById('township-category-menu').querySelector('.nav-main'))
      .querySelector(`[page="${TABLE_PAGE}"]`);
    townshipUI.defaultElements.btn.tsoTable = btnEle;

    const table = TOTablePage();
    const tableEle = ui.create(table, document.getElementById('DIV_CONTAINER').firstElementChild)
      .querySelector('#TSO_DIV_TABLE');
    townshipUI.defaultElements.div.tsoTable = tableEle;

    ctx.patch(Township, 'catchupTicks').after(function (result) {
      if (townshipUI.currentPage == TABLE_PAGE) {
        table.update();
      }
      return result;
    });

    ctx.patch(Township, 'buildBuilding').after(function (result) {
      if (townshipUI.currentPage == TABLE_PAGE) {
        table.update();
      }
    });

    ctx.patch(Township, 'destroyBuilding').after(function (result) {
      if (townshipUI.currentPage == TABLE_PAGE) {
        table.update();
      }
    });

    ctx.patch(TownshipUI, 'getPageButton').after(function (result, page) {
      if (page == TABLE_PAGE) {
        return this.defaultElements.btn.tsoTable;
      }
      return result;
    });

    ctx.patch(TownshipUI, 'showPage').after(function (result, pageID) {
      this.defaultElements.div.tsoTable.classList.add('d-none');
      if (pageID == TABLE_PAGE) {
        table.update();
        this.defaultElements.div.tsoTable.classList.remove('d-none');
      }
      return result;
    });

    // changePage(game.pages.getObjectByID("melvorD:Township"))
    // btnEle.click();
  });
}
