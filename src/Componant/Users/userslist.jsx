import React from "react";
import Users from "./users";
import style from './style.module.css';

const Userslist = ({ users, code_Comm, usersTeam, teams, userRole, unfilteredUsers }) => {
  // ✅ FIXED: Renamed the boolean variable to avoid conflict
  const hasFilteredUsers = unfilteredUsers.length > users.length;
  const shouldHideOnMobile = users.length === 0 && hasFilteredUsers;
    console.log('users in the userList : ' ,usersTeam)
  
  return (
    <div className={`${style.membersContainer} ${shouldHideOnMobile ? style.hideOnMobile : ''}`}>
      <h2 className={style.membersTitle}>Recommended Members</h2>
      <div className={style.list}>
        {users && users.length > 0 ? (
          users.map((user, index) => (
            <Users
              key={index}
              name={user.name}
              userName={user.userName}
              image={user.img}
              id={user._id}
              code_Comm={code_Comm}
              usersTeam={usersTeam}
              teams_comm={teams}
              userRole={userRole}
            />
          ))
        ) : (
          <p style={{ padding: "0 20px" }}>
            {hasFilteredUsers
              ? "All Users in Teams"
              : "No Users in Community yet"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Userslist;