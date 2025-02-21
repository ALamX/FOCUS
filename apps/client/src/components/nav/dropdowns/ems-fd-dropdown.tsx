import { useRouter } from "next/router";
import { ChevronDown } from "react-bootstrap-icons";
import { useTranslations } from "next-intl";
import { Dropdown } from "components/Dropdown";
import { Button } from "@snailycad/ui";
import { classNames } from "lib/classNames";
import { Permissions, usePermission } from "hooks/usePermission";

export function EmsFdDropdown() {
  const router = useRouter();
  const t = useTranslations("Nav");
  const isActive = (route: string) => router.pathname.startsWith(route);

  const { hasPermissions } = usePermission();
  const hasIncidentPermissions = hasPermissions([
    Permissions.ManageEmsFdIncidents,
    Permissions.ViewEmsFdIncidents,
  ]);
  const hasHospitalServicePermissions = hasPermissions([
    Permissions.ViewDeadCitizens,
    Permissions.ManageDeadCitizens,
  ]);

  return (
    <Dropdown
      trigger={
        <Button
          role="listitem"
          className={classNames(isActive("/ems-fd") && "font-semibold")}
          variant="bar"
        >
          {t("emsFd")}
          <span className="mt-1 ml-1">
            <ChevronDown width={15} height={15} className="text-white dark:text-white" />
          </span>
        </Button>
      }
    >
      <Dropdown.LinkItem href="/ems-fd">{t("dashboard")}</Dropdown.LinkItem>
      <Dropdown.LinkItem href="/ems-fd/my-deputies">{t("myDeputies")}</Dropdown.LinkItem>
      <Dropdown.LinkItem href="/ems-fd/my-deputy-logs">{t("myDeputyLogs")}</Dropdown.LinkItem>
      {hasIncidentPermissions ? (
        <Dropdown.LinkItem href="/ems-fd/incidents">{t("emsFdIncidents")}</Dropdown.LinkItem>
      ) : null}
      {hasHospitalServicePermissions ? (
        <Dropdown.LinkItem href="/ems-fd/hospital-services">
          {t("hospitalServices")}
        </Dropdown.LinkItem>
      ) : null}
    </Dropdown>
  );
}
