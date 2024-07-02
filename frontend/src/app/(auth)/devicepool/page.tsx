import DeviceTable from "@/components/DeviceTable";
import Legend from "@/components/Legend";
import HarborList from "@/components/HarborList";

export default function Home() {

    return (
        <>
            <HarborList/>
            <div style={{margin: 10,width:"100%"}}></div>
            <Legend/>
            <DeviceTable/>
        </>
    );
}
