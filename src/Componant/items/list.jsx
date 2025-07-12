import React from "react";
import style from './../../Pages/Community/style.module.css';
import Item from './item';

const List = ({ items }) => {
    console.log("Items array:", items); // Debugging step

    return (
        <div className={style.list}>
            {items.map((item, index) => {
                console.log("Item data:", item); // Check if item contains code_Comm
                return (
                    <Item 
                        key={index} 
                        communityName={item.communityName} 
                        code_Comm={item.code_Comm} 
                        description={item.description}
                        members={item.members}
                    />
                );
            })}
        </div>
    );
};

export default List;
