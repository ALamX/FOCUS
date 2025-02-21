import { useRouter } from "next/router";
import { ChevronDown } from "react-bootstrap-icons";
import { useTranslations } from "next-intl";
import { Dropdown } from "components/Dropdown";
import { Button } from "@snailycad/ui";
import { classNames } from "lib/classNames";
import { usePermission, Permissions } from "hooks/usePermission";

export function TowDropdown() {
  const router = useRouter();
  const t = useTranslations("Nav");
  const isActive = (route: string) => router.pathname.startsWith(route);
  const { hasPermissions } = usePermission();

  return (
    <Dropdown
      trigger={
        <Button className={classNames(isActive("/tow") && "font-semibold")} variant="bar">
          {t("tow")}
          <span className="mt-1 ml-1">
            <ChevronDown width={15} height={15} className="text-white dark:text-white" />
          </span>
        </Button>
      }
    >
      <Dropdown.LinkItem href="/tow">{t("dashboard")}</Dropdown.LinkItem>
      {hasPermissions([Permissions.ViewTowLogs]) ? (
        <Dropdown.LinkItem href="/tow/logs">{t("towLogs")}</Dropdown.LinkItem>
      ) : null}
    </Dropdown>
  );
}
