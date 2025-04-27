export interface Routing {
  id: string;
  label: string;
  route: string;
  queryParams?: { [key: string]: any };
  subMenu?: Routing[];
  isSubMenuOpen?: boolean;
}
