export function NavItem({page}) {
  return {
    $template: `#to-nav-item`,
    page,
    click() {
      townshipUI.showPage(page);
    }
  };
}
window.NavItem = NavItem;