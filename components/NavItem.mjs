export function NavItem({page, title, media, faIcon}) {
  return {
    $template: `#to-nav-item`,
    page,
    media,
    faIcon,
    title,
    click() {
      townshipUI.showPage(page);
    }
  };
}
window.NavItem = NavItem;