import * as React from "react";
import { useListener } from "@casper124578/use-socket.io";
import { SocketEvents } from "@snailycad/config";
import useFetch from "lib/useFetch";
import { useDispatchState } from "state/dispatch/dispatch-state";
import { useAuth } from "context/AuthContext";
import { useLeoState } from "state/leo-state";
import type { CombinedLeoUnit, Officer } from "@snailycad/types";
import { isUnitCombined } from "@snailycad/utils";
import type { GetActiveOfficersData } from "@snailycad/types/api";
import { useCall911State } from "state/dispatch/call-911-state";
import shallow from "zustand/shallow";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useActiveOfficers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { activeOfficers, setActiveOfficers } = useDispatchState();
  const { state, execute } = useFetch();
  const setActiveOfficer = useLeoState((state) => state.setActiveOfficer);
  const call911State = useCall911State(
    (state) => ({
      calls: state.calls,
      setCalls: state.setCalls,
    }),
    shallow,
  );

  useQuery({
    queryKey: ["/leo/active-officers"],
    queryFn: getActiveOfficers,
  });

  const handleCallsState = React.useCallback(
    (data: (Officer | CombinedLeoUnit)[]) => {
      const updatedCalls = [...call911State.calls].map((call) => {
        const newAssignedUnits = [...call.assignedUnits].map((assignedUnit) => {
          const unitIds = [assignedUnit.officerId, assignedUnit.combinedLeoId];
          const officer = data.find((v) => unitIds.includes(v.id));

          if (officer) {
            return {
              ...assignedUnit,
              unit: officer,
            };
          }

          return assignedUnit;
        });

        call.assignedUnits = newAssignedUnits;

        return call;
      });

      call911State.setCalls(updatedCalls);
    },
    [call911State.calls], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleState = React.useCallback(
    (data: (Officer | CombinedLeoUnit)[]) => {
      setActiveOfficers(data);

      const activeOfficer = data.find((v) => {
        if (isUnitCombined(v)) {
          return v.officers.some((v) => v.userId === user?.id);
        }

        return v.userId === user?.id;
      });

      if (activeOfficer) {
        setActiveOfficer(activeOfficer);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id],
  );

  async function getActiveOfficers() {
    const { json } = await execute<GetActiveOfficersData>({
      path: "/leo/active-officers?from-query=true&includeAll=true",
      noToast: true,
    });

    if (json && Array.isArray(json)) {
      handleState(json);
      return json;
    }

    return [];
  }

  useListener(SocketEvents.UpdateOfficerStatus, (data: (Officer | CombinedLeoUnit)[] | null) => {
    if (data && Array.isArray(data)) {
      handleState(data);
      handleCallsState(data);
      return;
    }

    queryClient.invalidateQueries(["/leo/active-officers"]);
  });

  return { activeOfficers, setActiveOfficers, state };
}
