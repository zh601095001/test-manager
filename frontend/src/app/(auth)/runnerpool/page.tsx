import React from 'react';
import RunnerTable from "@/app/(auth)/runnerpool/RunnerTable";
import RunnerSettings from "@/app/(auth)/runnerpool/RunnerSettings";

function Page() {
    return (
        <div>
            <RunnerSettings/>
            <RunnerTable/>
        </div>
    );
}

export default Page;