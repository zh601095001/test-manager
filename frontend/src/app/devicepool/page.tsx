import AddDevice from "@/components/AddDevice";
import LockDevice from "@/components/LockDevice";
import Tips from "@/components/Tips";
import DeviceTable from "@/components/DeviceTable";

export default function Home() {


    return (
        <>
            <h1 style={{textAlign: 'center', marginBottom: '20px'}}>设备状态管理</h1>
            <h3 style={{textAlign: 'center', marginBottom: '200px'}}>API Docs: <a
                href="http://192.168.6.88:8080/api-docs">http://192.168.6.88:8080/api-docs</a>
            </h3>
            <AddDevice/>
            <LockDevice/>
            <Tips/>
            <DeviceTable/>


            <div id="notification-container"></div>
        </>
    );
}
