"use client";

import React from "react";
import styles from "./Sidebar.module.css";
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { 

  HiChartPie, 
  HiInbox, 
  HiShoppingBag, 
  HiTable, 
  HiUser, 
  HiViewBoards 
} from "react-icons/hi";

export default function SidebarComponent() {
  return (
    <Sidebar aria-label="Sidebar" className={styles.sidebar}>
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem href="#" icon={HiChartPie}>Dashboard</SidebarItem>
          <SidebarItem href="#" icon={HiInbox} label="">liste des rendez-vous</SidebarItem>
          <SidebarItem href="/ListeSecretaires" icon={HiInbox} label="">liste des secretaires</SidebarItem>
          <SidebarItem href="/ListePatients" icon={HiShoppingBag}>liste des patients</SidebarItem>
          <SidebarItem href="#" icon={HiTable}>deconnection</SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}