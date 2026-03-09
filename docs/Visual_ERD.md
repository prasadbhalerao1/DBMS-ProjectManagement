# ER Diagram (Chen Notation)

This diagram uses standard symbols:

- **Rectangles** = Entities
- **Diamonds** = Relationships
- **Ovals** = Attributes
- **Bold/Underlined Ovals** = Key Attributes
- **Thick Borders** = Weak Entities / Total Participation

```mermaid
flowchart TD
    %% --- STYLING ---
    classDef entity fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef weakEntity fill:#e1f5fe,stroke:#01579b,stroke-width:5px;
    classDef rel fill:#fff9c4,stroke:#fbc02d,stroke-width:2px,shape:rhombus;
    classDef identifyingRel fill:#fff9c4,stroke:#fbc02d,stroke-width:5px,shape:rhombus;
    classDef attr fill:#ffffff,stroke:#333,stroke-width:1px,shape:stadium;
    classDef keyAttr fill:#ffffff,stroke:#333,stroke-width:2px,shape:stadium;
    classDef derivedAttr fill:#ffffff,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5,shape:stadium;

    %% --- ENTITIES ---
    USER[USER]:::entity
    WORKSPACE[WORKSPACE]:::entity
    PROJECT[PROJECT]:::entity
    TASK[TASK]:::entity
    COMMENT[COMMENT]:::weakEntity

    %% --- ATTRIBUTES ---

    %% User
    uid([<u>id</u>]):::keyAttr --- USER
    uemail([<u>email</u>]):::keyAttr --- USER
    uname([name]) --- USER
    uimage([image]) --- USER

    %% Workspace
    wid([<u>id</u>]):::keyAttr --- WORKSPACE
    wslug([<u>slug</u>]):::keyAttr --- WORKSPACE
    wname([name]) --- WORKSPACE
    wdesc([description]) --- WORKSPACE

    %% Project
    pid([<u>id</u>]):::keyAttr --- PROJECT
    pname([name]) --- PROJECT
    pstatus([status]) --- PROJECT
    ppriority([priority]) --- PROJECT
    pdates([dates]) --- PROJECT

    %% Task
    tid([<u>id</u>]):::keyAttr --- TASK
    ttitle([title]) --- TASK
    tstatus([status]) --- TASK
    ttype([type]) --- TASK
    toverdue([overdue]):::derivedAttr --- TASK

    %% Comment
    cid([<u>id</u>]):::keyAttr --- COMMENT
    ccontent([content]) --- COMMENT

    %% --- RELATIONSHIPS ---

    %% User Owns Workspace
    OWNS{Owns}:::rel
    USER ---|1| OWNS
    OWNS ---|M| WORKSPACE

    %% User Member of Workspace
    WS_MEM{Member Of}:::rel
    USER ===|M| WS_MEM
    WS_MEM ===|N| WORKSPACE

    %% Workspace Contains Project
    CONTAINS{Contains}:::rel
    WORKSPACE ---|1| CONTAINS
    CONTAINS ===|M| PROJECT

    %% User Leads Project
    LEADS{Leads}:::rel
    USER ---|1| LEADS
    LEADS ---|M| PROJECT

    %% User Member of Project
    PROJ_MEM{Member Of}:::rel
    USER ---|M| PROJ_MEM
    PROJ_MEM ---|N| PROJECT

    %% Project Has Task
    HAS_TASK{Has}:::rel
    PROJECT ---|1| HAS_TASK
    HAS_TASK ===|M| TASK

    %% User Assigned Task
    ASSIGNED{Assigned To}:::rel
    USER ---|1| ASSIGNED
    ASSIGNED ===|M| TASK

    %% Task Has Comment (Identifying)
    HAS_KA{Has}:::identifyingRel
    TASK ---|1| HAS_KA
    HAS_KA ===|M| COMMENT

    %% User Writes Comment
    WRITES{Writes}:::rel
    USER ---|1| WRITES
    WRITES ===|M| COMMENT

    %% --- LEGEND ---
    subgraph LEGEND [Legend]
        L_Ent[Entity]:::entity
        L_Weak[Weak Entity]:::weakEntity
        L_Rel{Relationship}:::rel
        L_IdRel{Identifying Rel}:::identifyingRel
        L_Attr([Attribute]):::attr
        L_Key([<u>Key Attribute</u>]):::keyAttr
        L_Der([Derived Attribute]):::derivedAttr
    end
```
