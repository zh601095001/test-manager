import DeviceTable from "./DeviceTable";
import Legend from "./Legend";
import HarborList from "./HarborList";

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
