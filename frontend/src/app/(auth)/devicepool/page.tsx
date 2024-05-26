import DeviceTable from "@/components/DeviceTable";
import Legend from "@/components/Legend";

export default function Home() {

    return (
        <>
            <Legend/>
            <DeviceTable/>
            <div id="notification-container"></div>
        </>
    );
}
