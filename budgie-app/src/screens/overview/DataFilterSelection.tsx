import { Text, Icon, IndexPath, MenuItem, OverflowMenu, TopNavigationAction } from "@ui-kitten/components";
import React, { FC, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import tailwind from "tailwind-rn";
import { DataFilter, useOverviewContext } from "./OverviewProvider";


const FILTER_LABELS: Record<DataFilter, string> = {
    "all": "All expenses",
    "single": "Single expenses",
    "reoccurring": "Reoccurring expenses"
};

/**
 TODO: Persistieren im local storage
 */
export const DataFilterSelection: FC = () => {
    const { dataFilter, setDataFilter } = useOverviewContext();

    const [menuVisible, setMenuVisible] = useState(false);

    const onItemSelect = (index: IndexPath) => {
        switch (index.row) {
            case 0:
                setDataFilter("all")
                break;
            case 1:
                setDataFilter("single")
                break;
            case 2:
                setDataFilter("reoccurring")
                break;
        }
        setMenuVisible(false);
    };


    return (
        <TouchableOpacity
            onPress={() => setMenuVisible(true)}
        >
            <View style={tailwind("flex-row")}>
                <Text>
                    {FILTER_LABELS[dataFilter]}
                </Text>
                <OverflowMenu
                    style={tailwind("mt-14")}
                    anchor={() =>
                        <TopNavigationAction
                            icon={(props) => (
                                <Icon {...props} name='more-vertical' />
                            )}
                            onPress={() => setMenuVisible(true)}
                        />
                    }
                    visible={menuVisible}
                    onSelect={onItemSelect}
                    onBackdropPress={() => setMenuVisible(false)}
                >
                    {
                        Object.entries(FILTER_LABELS).map(([key, label]) => (
                            <MenuItem
                                key={key}
                                title={label}
                                style={key === dataFilter ? { display: "none" } : {}}
                            />
                        ))
                    }
                </OverflowMenu>
            </View>
        </TouchableOpacity>
    )
}
