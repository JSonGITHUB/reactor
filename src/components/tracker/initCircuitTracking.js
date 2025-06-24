const initCircuitTracking = [
  {
    title: "Circuit Workout",
    circuitRounds: 3,
    circuitRest: 2,
    isCollapsed: true,
    warmup: {
      description: "Begin with a dynamic warm-up to get your blood flowing and muscles ready for the workout.",
      directive: "Perform combination: (5-10 minutes)",
      totalTime: 5,
      isCollapsed: true,
      excercises: [
        {
          title: "arm circles",
          link: "https://www.fitnesseducation.edu.au/wp-content/uploads/2020/10/Pushups.jpg",
          type: "timer",
          complete: false
        },
        {
          title: "leg swings",
          link: "https://www.fitnesseducation.edu.au/wp-content/uploads/2020/10/Pushups.jpg",
          type: "timer",
          complete: false
        },
        {
          title: "high knees",
          link: "https://www.fitnesseducation.edu.au/wp-content/uploads/2020/10/Pushups.jpg",
          type: "timer",
          complete: false
        }
      ],
    },
    circuits: [
      {
        title: "Surf Training Circuit 1",
        description: "Circuit will cycle through each exercise twice, circuit exercises 25 seconds on 10 seconds off.",
        time: 25,
        restTime: 10,
        isCollapsed: true,
        excersizes: [
          {
            title: "Goblet Squat",
            link: "https://www.youtube.com/watch?v=pEGfGwp6IEA",
            link: "https://www.youtube.com/watch?v=42bFodPahBU",
            type: "timer",
            complete: false
          },
          {
            title: "Bridge March",
            link: "https://www.youtube.com/watch?v=lD8TZAPjfLk",
            type: "timer",
            complete: false
          },
          {
            title: "Swing Left",
            link: "https://www.youtube.com/watch?v=ihsH785vBq0",
            type: "timer",
            complete: false
          },
          {
            title: "Swing Right",
            link: "https://www.youtube.com/watch?v=ihsH785vBq0",
            type: "timer",
            complete: false
          },
          {
            title: "Goblet Squat",
            link: "https://www.youtube.com/watch?v=pEGfGwp6IEA",
            link: "https://www.youtube.com/watch?v=42bFodPahBU",
            type: "timer",
            complete: false
          },
          {
            title: "Bridge March",
            link: "https://www.youtube.com/watch?v=lD8TZAPjfLk",
            type: "timer",
            complete: false
          },
          {
            title: "Swing Left",
            link: "https://www.youtube.com/watch?v=ihsH785vBq0",
            type: "timer",
            complete: false
          },
          {
            title: "Swing Right",
            link: "https://www.youtube.com/watch?v=ihsH785vBq0",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Corrective Circuit 1",
        description: "Corrective Circuit exercises 30 seconds on 10 seconds off",
        time: 30,
        restTime: 10,
        isCollapsed: true,
        excersizes: [
          {
            title: "Jane Fonda's Left",
            link: "https://www.youtube.com/shorts/0wLcrmxwvW8",
            type: "timer",
            complete: false
          },
          {
            title: "Jane Fonda's Right",
            link: "https://www.youtube.com/shorts/0wLcrmxwvW8",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            type: "timer",
            complete: false
          },
          {
            title: "Abductor Left Hip Slides one and a half style",
            link: "https://www.youtube.com/watch?v=-6Ksus4QfE4",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          },
          {
            title: "Abductor Right Hip Slides one and a half style",
            link: "https://www.youtube.com/watch?v=-6Ksus4QfE4",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Circuit 2",
        description: "Circuit will cycle through each exercise twice, circuit exercises 25 seconds on 10 seconds off.",
        time: 25,
        restTime: 10,
        isCollapsed: true,
        excersizes: [
          {
            title: "Reverse Lunge",
            link: "https://www.youtube.com/watch?v=xrPteyQLGAo",
            link: "https://www.youtube.com/watch?v=_LGpDtENZ5U",
            type: "timer",
            complete: false
          },
          {
            title: "Sprinter",
            link: "https://www.youtube.com/watch?v=g8-Ge9S0aUw",
            link: "https://www.youtube.com/watch?v=1J8mVmtyYpk",
            link: "https://www.youtube.com/watch?v=B0_E6hzVaDE",
            type: "timer",
            complete: false
          },
          {
            title: "Jump Squats",
            link: "https://www.youtube.com/shorts/IfqrxS_-8oU",
            link: "https://www.youtube.com/watch?v=txLE-jOCEsc",
            type: "timer",
            complete: false
          },
          {
            title: "Reverse Lunge",
            link: "https://www.youtube.com/watch?v=xrPteyQLGAo",
            link: "https://www.youtube.com/watch?v=_LGpDtENZ5U",
            type: "timer",
            complete: false
          },
          {
            title: "Sprinter",
            link: "https://www.youtube.com/watch?v=g8-Ge9S0aUw",
            link: "https://www.youtube.com/watch?v=1J8mVmtyYpk",
            link: "https://www.youtube.com/watch?v=B0_E6hzVaDE",
            type: "timer",
            complete: false
          },
          {
            title: "Jump Squats",
            link: "https://www.youtube.com/shorts/IfqrxS_-8oU",
            link: "https://www.youtube.com/watch?v=txLE-jOCEsc",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Corrective Circuit 2",
        description: "Same as Corrective Circuit 1 but one and a half style for James Fonda's instead.",
        time: 30,
        restTime: 10,
        isCollapsed: true,
        excersizes: [
          {
            title: "Jane Fonda's (one and a half style)",
            link: "https://www.youtube.com/shorts/0wLcrmxwvW8",
            type: "timer",
            complete: false
          },
          {
            title: "Jane Fonda's (one and a half style)",
            link: "https://www.youtube.com/shorts/0wLcrmxwvW8",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            type: "timer",
            complete: false
          },
          {
            title: "Abductor Left Hip Slides one and a half style",
            link: "https://www.youtube.com/watch?v=KeoRRIqmSqY",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          },
          {
            title: "Abductor Right Hip Slides one and a half style",
            link: "https://www.youtube.com/watch?v=KeoRRIqmSqY",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Circuit 3",
        description: "Circuit will cycle through each exercise twice, circuit exercises 25 seconds on 10 seconds off.",
        time: 25,
        restTime: 10,
        isCollapsed: true,
        excersizes: [
          {
            title: "Hamstring RDL",
            link: "https://www.youtube.com/shorts/mRQnltEJ_74",
            type: "timer",
            complete: false
          },
          {
            title: "Glute Power RDL",
            link: "https://www.youtube.com/shorts/mRQnltEJ_74",
            type: "timer",
            complete: false
          },
          {
            title: "Hamstring RDL",
            link: "https://www.youtube.com/shorts/mRQnltEJ_74",
            type: "timer",
            complete: false
          },
          {
            title: "Glute Power RDL",
            link: "https://www.youtube.com/shorts/mRQnltEJ_74",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Corrective Circuit 3",
        description: "Corrective Circuit 3, Same as Corrective Circuit 1, exercises 30 seconds on 10 seconds off",
        time: 30,
        restTime: 10,
        isCollapsed: true,
        excersizes: [
          {
            title: "Jane Fonda's Left",
            link: "https://www.youtube.com/shorts/0wLcrmxwvW8",
            type: "timer",
            complete: false
          },
          {
            title: "Jane Fonda's Right",
            link: "https://www.youtube.com/shorts/0wLcrmxwvW8",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            type: "timer",
            complete: false
          },
          {
            title: "Abductor Left Hip Slides one and a half style",
            link: "https://www.youtube.com/watch?v=KeoRRIqmSqY",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          },
          {
            title: "Abductor Right Hip Slides one and a half style",
            link: "https://www.youtube.com/watch?v=KeoRRIqmSqY",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Circuit 4",
        description: "Circuit will cycle through each exercise twice, circuit exercises 25 seconds on 10 seconds off.",
        time: 25,
        restTime: 10,
        isCollapsed: true,
        excersizes: [
          {
            title: "Reverse Creeping Lunge",
            link: "https://www.youtube.com/watch?v=VPJfo8Eldg4",
            type: "timer",
            complete: false
          },
          {
            title: "Long Leg Bridge",
            link: "https://www.youtube.com/watch?v=kH_dghl702Q",
            type: "timer",
            complete: false
          },
          {
            title: "Sprinter Plyo Lunge",
            link: "https://www.youtube.com/watch?v=JCyJ_jW0lHo",
            link: "https://www.youtube.com/watch?v=B0_E6hzVaDE",
            type: "timer",
            complete: false
          }, {
            title: "Reverse Creeping Lunge",
            link: "https://www.youtube.com/watch?v=VPJfo8Eldg4",
            type: "timer",
            complete: false
          },
          {
            title: "Long Leg Bridge",
            link: "https://www.youtube.com/watch?v=kH_dghl702Q",
            type: "timer",
            complete: false
          },
          {
            title: "Sprinter Plyo Lunge",
            link: "https://www.youtube.com/watch?v=JCyJ_jW0lHo",
            link: "https://www.youtube.com/watch?v=B0_E6hzVaDE",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Corrective Circuit 4",
        description: "Corrective Circuit 4, Same as Corrective Circuit 2, exercises 30 seconds on 10 seconds off",
        time: 30,
        restTime: 10,
        isCollapsed: true,
        excersizes: [
          {
            title: "Jane Fonda's Left (one and a half style)",
            link: "https://www.youtube.com/shorts/0wLcrmxwvW8",
            type: "timer",
            complete: false
          },
          {
            title: "Jane Fonda's Right (one and a half style)",
            link: "https://www.youtube.com/shorts/0wLcrmxwvW8",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            type: "timer",
            complete: false
          },
          {
            title: "Abductor Left Hip Slides one and a half style",
            link: "https://www.youtube.com/watch?v=KeoRRIqmSqY",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          },
          {
            title: "Abductor Right Hip Slides one and a half style",
            link: "https://www.youtube.com/watch?v=KeoRRIqmSqY",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Core Circuit",
        description: "Core Circuit, exercises 45 seconds on 15 seconds off",
        time: 45,
        restTime: 15,
        isCollapsed: true,
        excersizes: [
          {
            title: "Laying Leg Flutters",
            link: "https://www.youtube.com/watch?v=K5wuM_gNWyw",
            type: "timer",
            complete: false
          },
          {
            title: "Reach Ups",
            link: "https://www.youtube.com/watch?v=73Cb-y57UWg",
            type: "timer",
            complete: false
          },
          {
            title: "Jack Knives",
            link: "https://www.youtube.com/shorts/Kufye7qsUXI",
            link: "https://www.youtube.com/watch?v=5kvKmRGADlQ",
            type: "timer",
            complete: false
          },
          {
            title: "Boat Holds",
            link: "https://www.youtube.com/watch?v=VN-6jygZ094",
            link: "https://www.youtube.com/watch?v=WGwI629aTAY",
            type: "timer",
            complete: false
          },
          {
            title: "Laying Windshield Wipers",
            link: "https://www.youtube.com/watch?v=fNf_IfTAVD0",
            type: "timer",
            complete: false
          },
          {
            title: "Star Crunches",
            link: "https://www.youtube.com/watch?v=HBB5tf2vndA",
            type: "timer",
            complete: false
          },
          {
            title: "Seated In and Outs",
            link: "https://www.youtube.com/watch?v=d1CaYcMApDw",
            type: "timer",
            complete: false
          },
          {
            title: "Russian Twists",
            link: "https://www.youtube.com/watch?v=DJQGX2J4IVw",
            type: "timer",
            complete: false
          },
          {
            title: "Bicycles",
            link: "https://www.youtube.com/watch?v=-nJkAJpQemI",
            type: "timer",
            complete: false
          },
          {
            title: "Mountain Climbers",
            link: "https://www.youtube.com/watch?v=YZstn7BkgvU",
            link: "https://www.youtube.com/watch?v=wQq3ybaLZeA",
            type: "timer",
            complete: false
          },
          {
            title: "High Left Side Plank Raises",
            link: "https://www.youtube.com/watch?v=2W96p2PIoPg",
            type: "timer",
            complete: false
          },
          {
            title: "High Right Side Plank Raises",
            link: "https://www.youtube.com/watch?v=2W96p2PIoPg",
            type: "timer",
            complete: false
          },
          {
            title: "Side Plank Reach Throughs",
            link: "https://www.youtube.com/watch?v=PqUi-H1edcE",
            type: "timer",
            complete: false
          },
          {
            title: "Plank Taps",
            link: "https://www.youtube.com/watch?v=QGnz__47PCo",
            type: "timer",
            complete: false
          },
          {
            title: "Leg Raises",
            link: "https://www.youtube.com/watch?v=dGKbTKLnym4",
            type: "timer",
            complete: false
          },
          {
            title: "Leg Down Holds",
            link: "https://www.youtube.com/watch?v=ahBd-oI76Zs",
            type: "timer",
            complete: false
          },
          {
            title: "In and Out Planks",
            link: "https://www.youtube.com/watch?v=Fcbw82ykBvY",
            link: "https://www.youtube.com/watch?v=JqZJW-bow2I",
            link: "https://www.youtube.com/watch?v=clsucWwp5Oc",
            type: "timer",
            complete: false
          },
          {
            title: "Side Plank Hold Left",
            link: "https://www.youtube.com/watch?v=2W96p2PIoPg",
            type: "timer",
            complete: false
          },
          {
            title: "Side Plank Hold Right",
            link: "https://www.youtube.com/watch?v=2W96p2PIoPg",
            type: "timer",
            complete: false
          },
          {
            title: "Chair Sit-ups Switching",
            link: "https://www.youtube.com/watch?v=swOyWKk7Oko",
            link: "https://www.youtube.com/watch?v=KojXAk4lXkE",
            type: "timer",
            complete: false
          },
          {
            title: "Mountain Climbers",
            link: "https://www.youtube.com/watch?v=wQq3ybaLZeA",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Injury Prevention Ankles Circuit",
        description: "Injury Prevention Ankles Circuit, exercises 2 minutes on 30 seconds off",
        time: 120,
        restTime: 30,
        isCollapsed: true,
        excersizes: [
          {
            title: "Single Left Leg Balance (until failure)",
            link: "https://www.youtube.com/watch?v=dK2vGx1oX6o",
            type: "timer",
            complete: false
          },
          {
            title: "Single Right Leg Balance (until failure)",
            link: "https://www.youtube.com/watch?v=dK2vGx1oX6o",
            type: "timer",
            complete: false
          },
          {
            title: "Single Left Leg Calf Raise 6 seconds up and down (until failure)",
            link: "https://www.youtube.com/watch?v=xVb3rW0a7Fw",
            type: "timer",
            complete: false
          },
          {
            title: "Single Right Leg Calf Raise 6 seconds up and down (until failure)",
            link: "https://www.youtube.com/watch?v=xVb3rW0a7Fw",
            type: "timer",
            complete: false
          },
          {
            title: "Balance Beam Balance (until failure)",
            link: "https://www.youtube.com/watch?v=FoPNGc6Lg8k",
            type: "timer",
            complete: false
          },
          {
            title: "Heal Raise Walks (until failure)",
            link: "https://www.fitnesseducation.edu.au/wp-content/uploads/2020/10/Pushups.jpg",
            type: "timer",
            complete: false
          },
          {
            title: "Heal Raise Walks on stairs (until failure)",
            link: "https://www.youtube.com/watch?v=GQa_N7wft7M",
            type: "timer",
            complete: false
          },
          {
            title: "Slanted Surface Reverse Lunges (until failure)",
            link: "https://www.youtube.com/watch?v=BDtm4dYSY_s",
            type: "timer",
            complete: false
          },
        ]
      },
      {
        title: "Surf Training Injury Prevention Knees Circuit",
        description: "Injury Prevention Knees Circuit, exercises 2 minutes on 30 seconds off",
        time: 120,
        restTime: 30,
        isCollapsed: true,
        excersizes: [
          {
            title: "Single Leg Hinge Stretch 20 second hold three times",
            link: "https://www.youtube.com/watch?v=6AZ85oH5A-I",
            link: "https://www.youtube.com/watch?v=0hxtMb6kcbs",
            link: "https://www.youtube.com/watch?v=_UB6Tp8fzEQ",
            type: "timer",
            complete: false
          },
          {
            title: "Knee Circles 20 second each direction",
            link: "https://www.youtube.com/watch?v=cYDkPDqeY5E",
            type: "timer",
            complete: false
          },
          {
            title: "Peterson Step Up 15 times.",
            link: "https://www.youtube.com/watch?v=yuvRE6PsvJw",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Calf Raise 15 each leg",
            link: "https://www.youtube.com/watch?v=xVb3rW0a7Fw",
            type: "timer",
            complete: false
          },
          {
            title: "Side Lying Leg Lift 12 with second pause at top",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            type: "timer",
            complete: false
          },
          {
            title: "Split Squat 12 reps with 10 second pause on last rep before knee touches the ground",
            link: "https://www.youtube.com/watch?v=SFSZVKzqnXA",
            type: "timer",
            complete: false
          },
          {
            title: "Squat to Caesar 6 reps",
            link: "https://www.youtube.com/watch?v=OfwqSK_Ghvk",
            type: "timer",
            complete: false
          },
        ]
      },
      {
        title: "Surf Training Injury Prevention Hips Circuit",
        description: "Injury Prevention Hips Circuit, exercises 2 minutes on 30 seconds off",
        time: 120,
        restTime: 30,
        isCollapsed: true,
        excersizes: [
          {
            title: "Single Leg Bridge (until failure)",
            link: "https://www.youtube.com/watch?v=ZgvzRn-16zI",
            type: "timer",
            complete: false
          },
          {
            title: "Glute Bridge March (until failure)",
            link: "https://www.youtube.com/watch?v=lD8TZAPjfLk",
            type: "timer",
            complete: false
          },
          {
            title: "Banded Clamshell pause for 5 seconds at top (until failure)",
            link: "https://www.youtube.com/shorts/qoOepTnrVyA",
            type: "timer",
            complete: false
          },
          {
            title: "Side lying Leg Lift. 5 second pause at top (until failure)",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Romanian Deadlift (until failure)",
            link: "https://www.youtube.com/watch?v=GoKjrvJi-Iw",
            link: "https://www.youtube.com/watch?v=gBPbL3AxzzE",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Romanian Deadlift Straight Leg (until failure single leg)",
            link: "https://www.youtube.com/watch?v=HtHxnWmMgzM",
            link: "https://www.youtube.com/watch?v=gBPbL3AxzzE",
            type: "timer",
            complete: false
          },
          {
            title: "Good Morning (until failure)",
            link: "https://www.youtube.com/watch?v=YA-h3n9L4YU",
            type: "timer",
            complete: false
          },
          {
            title: "Split Squat (until failure)",
            link: "https://www.youtube.com/watch?v=SFSZVKzqnXA",
            type: "timer",
            complete: false
          },
          {
            title: "Elevated Split Squat (until failure)",
            link: "https://www.youtube.com/shorts/uODWo4YqbT8",
            link: "https://www.youtube.com/watch?v=OUnSPY8KLfE",
            type: "timer",
            complete: false
          },
          {
            title: "Goblet Squat (until failure)",
            link: "https://www.youtube.com/watch?v=pEGfGwp6IEA",
            link: "https://www.youtube.com/watch?v=42bFodPahBU",
            type: "timer",
            complete: false
          },
          {
            title: "Back Deadlifts (until failure)",
            link: "https://www.youtube.com/shorts/vfKwjT5-86k",
            link: "https://www.youtube.com/watch?v=VyFDPMOy-eA",
            type: "timer",
            complete: false
          },
          {
            title: "Overhead Squat (until failure)",
            link: "https://www.youtube.com/watch?v=X1RI-qbO30I",
            link: "Overhead Squat",
            type: "timer",
            complete: false
          },
          {
            title: "Back Extensions 15 times",
            link: "https://www.youtube.com/shorts/Ff_-cmNax20",
            type: "timer",
            complete: false
          },
          {
            title: "Bird Dog 10 second holds (until failure) eight times",
            link: "https://www.youtube.com/watch?v=v0oCYe8__bU",
            type: "timer",
            complete: false
          },
          {
            title: "Bird Dog 10 second holds (until failure) six times",
            link: "https://www.youtube.com/watch?v=v0oCYe8__bU",
            type: "timer",
            complete: false
          },
          {
            title: "Bird Dog 10 second holds (until failure) four times",
            link: "https://www.youtube.com/watch?v=v0oCYe8__bU",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Injury Prevention Shoulders Circuit",
        description: "Injury Prevention Shoulders Circuit, exercises 2 minutes on 30 seconds off",
        time: 120,
        restTime: 30,
        isCollapsed: true,
        excersizes: [
          {
            title: "Full Cans 3 sets of 20",
            link: "https://www.youtube.com/shorts/C0_8cIRi3Og",
            type: "timer",
            complete: false
          },
          {
            title: "Side lying External Rotation 3 sets 20 times each side",
            link: "https://www.youtube.com/watch?v=badcVF85agg",
            type: "timer",
            complete: false
          },
          {
            title: "External Rotation Press 3 sets 15 times",
            link: "https://www.youtube.com/watch?v=NIK0aJDO7Pk",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Injury Prevention Neck Circuit",
        description: "Injury Prevention Neck Circuit, exercises 2 minutes on 30 seconds off",
        time: 120,
        restTime: 30,
        isCollapsed: true,
        excersizes: [
          {
            title: "Neck Ups (until failure)",
            link: "https://www.youtube.com/watch?v=8QyMRoSZM8c",
            type: "timer",
            complete: false
          },
          {
            title: "Neck Down (until failure)",
            link: "https://www.youtube.com/watch?v=8QyMRoSZM8c",
            type: "timer",
            complete: false
          },
          {
            title: "Neck Sides (until failure)",
            link: "https://www.youtube.com/watch?v=e-zXrtIPjMc",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Surf Training Injury Prevention Neck (chin in) Circuit",
        description: "all the same exercises but while tucking the chin in",
        time: 120,
        restTime: 30,
        isCollapsed: true,
        excersizes: [
          {
            title: "Neck Ups chin in (until failure)",
            link: "https://www.youtube.com/watch?v=8QyMRoSZM8c",
            type: "timer",
            complete: false
          },
          {
            title: "Neck Down chin in (until failure)",
            link: "https://www.youtube.com/watch?v=8QyMRoSZM8c",
            type: "timer",
            complete: false
          },
          {
            title: "Neck Sides chin in (until failure)",
            link: "https://www.youtube.com/watch?v=e-zXrtIPjMc",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Bodyweight",
        description: "Set the Timer: Determine the duration for each exercise, usually around 30 seconds to 1 minute. Arrange the exercises in a sequence that allows you to transition smoothly from one exercise to the next. Consider alternating between upper body and lower body exercises to give specific muscle groups time to rest.",
        time: 25,
        restTime: 5,
        isCollapsed: true,
        excersizes: [
          {
            title: "Squats",
            link: "https://www.youtube.com/watch?v=42bFodPahBU",
            type: "timer",
            complete: false
          },
          {
            title: "Pushups",
            link: "https://www.youtube.com/watch?v=R08gYyypGto",
            type: "timer",
            complete: false
          },
          {
            title: "Walking Lunges",
            link: "https://www.youtube.com/shorts/2ea3_b9rFdM",
            type: "timer",
            complete: false
          },
          {
            title: "Jump Rope",
            link: "https://www.youtube.com/watch?v=CYGeazlNbU4",
            type: "timer",
            complete: false
          },
          {
            title: "Burpees",
            link: "https://www.youtube.com/watch?v=818SkLAPyKY",
            type: "timer",
            complete: false
          },
          {
            title: "Plank Hold",
            link: "https://www.youtube.com/watch?v=Fcbw82ykBvY",
            type: "timer",
            complete: false
          },
          {
            title: "Mountain Climbers",
            link: "https://www.youtube.com/watch?v=wQq3ybaLZeA",
            type: "timer",
            complete: false
          },
          {
            title: "High Knees",
            link: "https://www.youtube.com/watch?v=ofVWxtDSNRg",
            type: "timer",
            complete: false
          },
          {
            title: "Triceps Dips",
            link: "https://www.youtube.com/watch?v=JhX1nBnirNw",
            type: "timer",
            complete: false
          },
          {
            title: "Reverse Lunges",
            link: "https://www.youtube.com/watch?v=xrPteyQLGAo",
            link: "https://www.youtube.com/watch?v=_LGpDtENZ5U",
            type: "timer",
            complete: false
          },
          {
            title: "Plank Jacks",
            link: "https://www.youtube.com/watch?v=9A7ZAXxMV0Q",
            type: "timer",
            complete: false
          },
          {
            title: "Glute Bridges",
            link: "https://www.youtube.com/watch?v=ZgvzRn-16zI",
            link: "https://www.youtube.com/watch?v=9qo48CYN06w",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Dumbells",
        description: "Set the Timer: Determine the duration for each exercise, usually around 30 seconds to 1 minute. Arrange the exercises in a sequence that allows you to transition smoothly from one exercise to the next. Consider alternating between upper body and lower body exercises to give specific muscle groups time to rest.",
        time: 25,
        restTime: 5,
        isCollapsed: true,
        excersizes: [
          {
            title: "Bicep Curls",
            link: "https://www.youtube.com/watch?v=pB4Iic8p6Ag",
            type: "timer",
            complete: false
          },
          {
            title: "Overhead Press",
            link: "https://www.youtube.com/watch?v=2OpSgEwaguk",
            type: "timer",
            complete: false
          }
        ]
      },
      {
        title: "Bodyweight Complete",
        description: "Set the Timer: Determine the duration for each exercise, usually around 30 seconds to 1 minute. Arrange the exercises in a sequence that allows you to transition smoothly from one exercise to the next. Consider alternating between upper body and lower body exercises to give specific muscle groups time to rest.",
        time: 35,
        restTime: 20,
        isCollapsed: true,
        excersizes: [
          {
            title: "Jumping Jacks",
            link: "https://www.youtube.com/watch?v=2W4ZNSwoW_4",
            type: "timer",
            complete: false
          },
          {
            title: "Knee Push Ups",
            link: "https://www.youtube.com/watch?v=jWxvty2KROs",
            type: "timer",
            complete: false
          },
          {
            title: "Heel Touch",
            link: "https://www.youtube.com/watch?v=9bR-elyolBQ",
            type: "timer",
            complete: false
          },
          {
            title: "Mountain Climber",
            link: "https://www.youtube.com/watch?v=wQq3ybaLZeA",
            type: "timer",
            complete: false
          },
          {
            title: "Abdominal Crunches",
            link: "https://www.youtube.com/watch?v=RUNrHkbP4Pc",
            type: "timer",
            complete: false
          },
          {
            title: "Cobra Stretch",
            link: "https://www.youtube.com/watch?v=z21McHHOpAg",
            type: "timer",
            complete: false
          },
          {
            title: "High Stepping",
            link: "https://www.youtube.com/watch?v=Cmxr9xcNhgU",
            type: "timer",
            complete: false
          },
          {
            title: "Russian Twist",
            link: "https://www.youtube.com/watch?v=DJQGX2J4IVw",
            type: "timer",
            complete: false
          },
          {
            title: "Side Crunches Right",
            link: "https://www.youtube.com/watch?v=w0OWFjfI3zM",
            type: "timer",
            complete: false
          },
          {
            title: "Side Crunches Left",
            link: "https://www.youtube.com/watch?v=w0OWFjfI3zM",
            type: "timer",
            complete: false
          },
          {
            title: "Dynamic Chest",
            link: "https://www.youtube.com/watch?v=kLmWN3Qsj0A",
            type: "timer",
            complete: false
          },
          {
            title: "Chest Strecth",
            link: "https://www.youtube.com/watch?v=NS64IgKUyeY",
            type: "timer",
            complete: false
          },
          {
            title: "Sit Ups",
            link: "https://www.youtube.com/watch?v=swOyWKk7Oko",
            type: "timer",
            complete: false
          },
          {
            title: "Plank",
            link: "https://www.youtube.com/watch?v=Fcbw82ykBvY",
            type: "timer",
            complete: false
          },
          {
            title: "Reverse Crunches",
            link: "https://www.youtube.com/watch?v=UwRfRN5fYRg",
            type: "timer",
            complete: false
          },
          {
            title: "Squats",
            link: "https://www.youtube.com/watch?v=42bFodPahBU",
            type: "timer",
            complete: false
          },
          {
            title: "Bicycle Crunches",
            link: "https://www.youtube.com/watch?v=-nJkAJpQemI",
            type: "timer",
            complete: false
          },
          {
            title: "Push ups",
            link: "https://www.youtube.com/watch?v=R08gYyypGto",
            type: "timer",
            complete: false
          },
          {
            title: "Lying Twist Stretch",
            link: "https://www.youtube.com/watch?v=ZI-j_POtzlU",
            type: "timer",
            complete: false
          },
          {
            title: "Star Crawl",
            link: "https://www.youtube.com/watch?v=M_uNXxdI018",
            type: "timer",
            complete: false
          },
          {
            title: "Flutter kicks",
            link: "https://www.youtube.com/watch?v=K5wuM_gNWyw",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Bicycle Crunches",
            link: "https://www.youtube.com/watch?v=8lsAXzvVHrc",
            type: "timer",
            complete: false
          },
          {
            title: "Tricep Dips",
            link: "https://www.youtube.com/watch?v=JhX1nBnirNw",
            type: "timer",
            complete: false
          },
          {
            title: "Bent Leg Twist",
            link: "https://www.youtube.com/watch?v=chWR8vsuamo",
            type: "timer",
            complete: false
          },
          {
            title: "Leg Raises",
            link: "https://www.youtube.com/watch?v=dGKbTKLnym4",
            type: "timer",
            complete: false
          },
          {
            title: "Leg Barbel Curl Left",
            link: "https://www.youtube.com/watch?v=3kZS8HVFquk",
            type: "timer",
            complete: false
          },
          {
            title: "Leg Barbel Curl Right",
            link: "https://www.youtube.com/watch?v=3kZS8HVFquk",
            type: "timer",
            complete: false
          },
          {
            title: "Clapping Crunch",
            link: "https://www.youtube.com/watch?v=LUQt2wSOFNM",
            type: "timer",
            complete: false
          },
          {
            title: "Burpees",
            link: "https://www.youtube.com/watch?v=818SkLAPyKY",
            type: "timer",
            complete: false
          },
          {
            title: "Incline Pushups",
            link: "https://www.youtube.com/watch?v=3WUUeM07i_Q",
            type: "timer",
            complete: false
          },
          {
            title: "Biceps Stretch Left",
            link: "https://www.youtube.com/watch?v=jw8EXo5h0ec",
            type: "timer",
            complete: false
          },
          {
            title: "Biceps Stretch Right",
            link: "https://www.youtube.com/watch?v=jw8EXo5h0ec",
            type: "timer",
            complete: false
          },
          {
            title: "Alternating Hooks",
            link: "https://www.youtube.com/watch?v=wiyvVpEKOsc",
            type: "timer",
            complete: false
          },
          {
            title: "Skipping Without Rope",
            link: "https://www.youtube.com/watch?v=CYGeazlNbU4",
            type: "timer",
            complete: false
          },
          {
            title: "Side Bridges Left",
            link: "https://www.youtube.com/watch?v=7ytbYd4CK3o",
            type: "timer",
            complete: false
          },
          {
            title: "Side Bridges Right",
            link: "https://www.youtube.com/watch?v=7ytbYd4CK3o",
            type: "timer",
            complete: false
          },
          {
            title: "Cross Arm Crunches",
            link: "https://www.youtube.com/watch?v=Qz3ylqqJ90M",
            type: "timer",
            complete: false
          },
          {
            title: "Hover Pushups",
            link: "https://www.youtube.com/watch?v=6wdVoBSkU0Y",
            type: "timer",
            complete: false
          },
          {
            title: "Lying Swing Legs",
            link: "https://www.youtube.com/watch?v=hIoFHFyZJnE",
            type: "timer",
            complete: false
          },
          {
            title: "Hindu Pushups",
            link: "https://www.youtube.com/watch?v=HE0ijmUc6Og",
            type: "timer",
            complete: false
          },
          {
            title: "Crunch Kicks",
            link: "https://www.youtube.com/watch?v=z0zwPZrPpXc",
            type: "timer",
            complete: false
          },
          {
            title: "V-Ups",
            link: "https://www.youtube.com/watch?v=iFaZ095MMGg",
            type: "timer",
            complete: false
          },
          {
            title: "Bridge",
            link: "https://www.youtube.com/watch?v=9qo48CYN06w",
            type: "timer",
            complete: false
          },
          {
            title: "Inch Worms",
            link: "https://www.youtube.com/watch?v=ZY2ji_Ho0dA",
            type: "timer",
            complete: false
          },
          {
            title: "Froggy Glute Lifts",
            link: "https://www.youtube.com/watch?v=wl10q6aqy-4",
            type: "timer",
            complete: false
          },
          {
            title: "Elbows Back",
            link: "https://www.youtube.com/watch?v=rhtadqkrWo0",
            type: "timer",
            complete: false
          },
          {
            title: "Wide Arm Pushups",
            link: "https://www.youtube.com/watch?v=pQUsUHvyoI0",
            type: "timer",
            complete: false
          },
          {
            title: "Side Lunges",
            link: "https://www.youtube.com/watch?v=tlUg1DXhHm8",
            type: "timer",
            complete: false
          },
          {
            title: "Triceps Stretch Left",
            link: "https://www.youtube.com/watch?v=L9IGOcrdcFk",
            type: "timer",
            complete: false
          },
          {
            title: "Triceps Stretch Right",
            link: "https://www.youtube.com/watch?v=L9IGOcrdcFk",
            type: "timer",
            complete: false
          },
          {
            title: "Reclined Oblique Twist",
            link: "https://www.youtube.com/watch?v=XKW5jru5pGo",
            type: "timer",
            complete: false
          },
          {
            title: "V Crunch",
            link: "https://www.youtube.com/watch?v=AkHgaJiwtFE",
            type: "timer",
            complete: false
          },
          {
            title: "Sit-Up Twist",
            link: "https://www.youtube.com/watch?v=_xzyH6NP_9k",
            type: "timer",
            complete: false
          },
          {
            title: "Spine Lumbar Twist Stretch",
            link: "https://www.youtube.com/watch?v=ryNlb_0GmAw",
            type: "timer",
            complete: false
          },
          {
            title: "Rhomboid Pulls",
            link: "https://www.youtube.com/watch?v=DEyDbzSudEU",
            type: "timer",
            complete: false
          },
          {
            title: "Military Push-Ups",
            link: "https://www.youtube.com/watch?v=H8LoGZ-ZN48",
            type: "timer",
            complete: false
          },
          {
            title: "Left Side Lying Floor Stretch",
            link: "https://www.youtube.com/watch?v=DMlSdmsHEeI",
            type: "timer",
            complete: false
          },
          {
            title: "Right Side Lying Floor Stretch",
            link: "https://www.youtube.com/watch?v=DMlSdmsHEeI",
            type: "timer",
            complete: false
          },
          {
            title: "Diagonal Plank",
            link: "https://www.youtube.com/watch?v=OGfFtF-dhrk",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Push-Ups",
            link: "https://www.youtube.com/watch?v=EOf3cGIQpA4",
            type: "timer",
            complete: false
          },
          {
            title: "Long-Arm Crunches",
            link: "https://www.youtube.com/watch?v=GxKoSEkmRC8",
            type: "timer",
            complete: false
          },
          {
            title: "Prone Triceps Push-Ups",
            link: "https://www.youtube.com/watch?v=Rr43jMaoJ9g",
            type: "timer",
            complete: false
          },
          {
            title: "Heals to the heavans",
            link: "https://www.youtube.com/watch?v=wdS2U6z0JGY",
            type: "timer",
            complete: false
          },
          {
            title: "Sumo Squat Calf Raises With Wall",
            link: "https://www.youtube.com/watch?v=Hcy81KUTIZ8",
            type: "timer",
            complete: false
          },
          {
            title: "Seated ABS Circles",
            link: "https://www.youtube.com/watch?v=GflQ_ymx9Nw",
            type: "timer",
            complete: false
          },
          {
            title: "Side Hop",
            link: "https://www.youtube.com/watch?v=nYmUEJIBj3c",
            type: "timer",
            complete: false
          },
          {
            title: "V-Up",
            link: "https://www.youtube.com/watch?v=5kvKmRGADlQ",
            type: "timer",
            complete: false
          },
          {
            title: "Floor Tricep Dips",
            link: "https://www.youtube.com/watch?v=geNkbcZ6qDo",
            type: "timer",
            complete: false
          },
          {
            title: "Arm Circles",
            link: "https://www.youtube.com/watch?v=Lha66p0ZXUc",
            type: "timer",
            complete: false
          },
          {
            title: "Up and Down Plank",
            link: "https://www.youtube.com/watch?v=Rr1Xq5Hmg7A",
            type: "timer",
            complete: false
          },
          {
            title: "Leg In and Outs",
            link: "https://www.youtube.com/watch?v=V1wZc9RwPW8",
            type: "timer",
            complete: false
          },
          {
            title: "X Man Crunch",
            link: "https://www.youtube.com/watch?v=f_ZsJgaqFNE",
            type: "timer",
            complete: false
          },
          {
            title: "Crossover Crunch",
            link: "https://www.youtube.com/watch?v=q2_KHKE5CDE",
            type: "timer",
            complete: false
          },
          {
            title: "Arm Circles",
            link: "https://www.youtube.com/watch?v=h6GkzSA5tTc",
            type: "timer",
            complete: false
          },
          {
            title: "Star Jumps",
            link: "https://www.youtube.com/watch?v=VVEO_J1tIXU",
            type: "timer",
            complete: false
          },
          {
            title: "Supine Pushups",
            link: "https://www.youtube.com/watch?v=WwbgPb9Gb48",
            type: "timer",
            complete: false
          },
          {
            title: "Squat Pulses",
            link: "https://www.youtube.com/watch?v=7HarjcM6b10",
            type: "timer",
            complete: false
          },
          {
            title: "Spiderman Pushups",
            link: "https://www.youtube.com/watch?v=YmonBKorAIw",
            type: "timer",
            complete: false
          },
          {
            title: "Reverse Snow Angels",
            link: "https://www.youtube.com/watch?v=0qLP2RNKX4A",
            type: "timer",
            complete: false
          },
          {
            title: "Shoulder Gators",
            link: "https://www.youtube.com/watch?v=JWp8_LGkTR8",
            type: "timer",
            complete: false
          },
          {
            title: "Lateral Plank Walk",
            link: "https://www.youtube.com/watch?v=yCVyaX-RjLM",
            type: "timer",
            complete: false
          },
          {
            title: "Donkey Kicks Left",
            link: "https://www.youtube.com/watch?v=4ranVQDqlaU",
            type: "timer",
            complete: false
          },
          {
            title: "Donkey Kicks Right",
            link: "https://www.youtube.com/watch?v=4ranVQDqlaU",
            type: "timer",
            complete: false
          },
          {
            title: "Straight Arm Plank",
            link: "https://www.youtube.com/watch?v=OxTE4Fu-Kmw",
            type: "timer",
            complete: false
          },
          {
            title: "Triceps Kickback",
            link: "https://www.youtube.com/watch?v=f3E7eEq2c6c",
            type: "timer",
            complete: false
          },
          {
            title: "Arm Scissors",
            link: "https://www.youtube.com/watch?v=pFrJQ-MyL10",
            type: "timer",
            complete: false
          },
          {
            title: "Starfish Crunch",
            link: "https://www.youtube.com/watch?v=HBB5tf2vndA",
            type: "timer",
            complete: false
          },
          {
            title: "Right Glute Kickback CrossOver Left Leg",
            link: "https://www.youtube.com/watch?v=e25jpcjeyAQ",
            type: "timer",
            complete: false
          },
          {
            title: "Left Glute Kickback CrossOver Right Leg",
            link: "https://www.youtube.com/watch?v=e25jpcjeyAQ",
            type: "timer",
            complete: false
          },
          {
            title: "Plank Taps",
            link: "https://www.youtube.com/watch?v=QGnz__47PCo",
            type: "timer",
            complete: false
          },
          {
            title: "Plie Squats",
            link: "https://www.youtube.com/watch?v=XEKiRnwBfYA",
            type: "timer",
            complete: false
          },
          {
            title: "Butt Kicks",
            link: "https://www.youtube.com/watch?v=vXVPvY1UbJI",
            type: "timer",
            complete: false
          },
          {
            title: "Arm Curls Crunch Left",
            link: "https://www.youtube.com/watch?v=pxsOe8MJq68",
            type: "timer",
            complete: false
          },
          {
            title: "Arm Curls Crunch Right",
            link: "https://www.youtube.com/watch?v=pxsOe8MJq68",
            type: "timer",
            complete: false
          },
          {
            title: "Modified Push-Up Low Hold",
            link: "https://www.youtube.com/watch?v=fobiVgoeeZA",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Dumbell Chest Fly Left",
            link: "https://www.youtube.com/watch?v=rvpbZiife1I",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Dumbell Chest Fly Right",
            link: "https://www.youtube.com/watch?v=rvpbZiife1I",
            type: "timer",
            complete: false
          },
          {
            title: "Child Pose",
            link: "https://www.youtube.com/watch?v=DMwRPGMPB10",
            type: "timer",
            complete: false
          },
          {
            title: "Box Push-Ups",
            link: "https://www.youtube.com/watch?v=dcJVA2sBPqw",
            type: "timer",
            complete: false
          },
          {
            title: "Left Side-Lying Leg Lift",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            type: "timer",
            complete: false
          },
          {
            title: "Right Side-Lying Leg Lift",
            link: "https://www.youtube.com/watch?v=VlwBJE1WtOQ",
            type: "timer",
            complete: false
          },
          {
            title: "Reverse Crunches With Legs Raised",
            link: "https://www.youtube.com/watch?v=dV8ll1vnle0",
            type: "timer",
            complete: false
          },
          {
            title: "Side Plank Left",
            link: "https://www.youtube.com/watch?v=2W96p2PIoPg",
            type: "timer",
            complete: false
          },
          {
            title: "Side Plank Right",
            link: "https://www.youtube.com/watch?v=2W96p2PIoPg",
            type: "timer",
            complete: false
          },
          {
            title: "Curtsy Lunges",
            link: "https://www.youtube.com/watch?v=-rTyKlHjYT8",
            type: "timer",
            complete: false
          },
          {
            title: "Cross Knee Plank",
            link: "https://www.youtube.com/watch?v=O4fFIYpYySU",
            type: "timer",
            complete: false
          },
          {
            title: "Lunge Twist",
            link: "https://www.youtube.com/watch?v=AVC14AUS8Gg",
            type: "timer",
            complete: false
          },
          {
            title: "Tiger Bend Push-ups",
            link: "https://www.youtube.com/watch?v=i-nQPot8ass",
            type: "timer",
            complete: false
          },
          {
            title: "Backward Lunge",
            link: "https://www.youtube.com/watch?v=_LGpDtENZ5U",
            type: "timer",
            complete: false
          },
          {
            title: "Staggered Push-Ups",
            link: "https://www.youtube.com/watch?v=JWNTTiAQMhc",
            type: "timer",
            complete: false
          },
          {
            title: "Diamond Push-Ups",
            link: "https://www.youtube.com/watch?v=UCmqw3kKZ38",
            type: "timer",
            complete: false
          },
          {
            title: "Chest Press Pulse",
            link: "https://www.youtube.com/watch?v=Fz4oo1vFo9M",
            type: "timer",
            complete: false
          },
          {
            title: "Plank Jacks",
            link: "https://www.youtube.com/watch?v=9A7ZAXxMV0Q",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Standing Left Glute Kickbacks",
            link: "https://www.youtube.com/watch?v=qzqDHSDTc0U",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Standing Right Glute Kickbacks",
            link: "https://www.youtube.com/watch?v=qzqDHSDTc0U",
            type: "timer",
            complete: false
          },
          {
            title: "Side Arm Raise",
            link: "https://www.youtube.com/watch?v=YslHgg2E-Ro",
            type: "timer",
            complete: false
          },
          {
            title: "Alt V-Up",
            link: "https://www.youtube.com/watch?v=k8_a4wFtG1I",
            type: "timer",
            complete: false
          },
          {
            title: "Swimmer and Superman",
            link: "https://www.youtube.com/watch?v=XydDDn_Rngw",
            type: "timer",
            complete: false
          },
          {
            title: "Lunges",
            link: "https://www.youtube.com/watch?v=1J8mVmtyYpk",
            type: "timer",
            complete: false
          },
          {
            title: "Floor Y Raises",
            link: "https://www.youtube.com/watch?v=lUGi7NilqWA",
            type: "timer",
            complete: false
          },
          {
            title: "Lying Butterfly Stretch",
            link: "https://www.youtube.com/watch?v=bzfY0Zr3sUE",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Left Oblique Crunches",
            link: "https://www.youtube.com/watch?v=wD2GY3fUJqQ",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Right Oblique Crunches",
            link: "https://www.youtube.com/watch?v=wD2GY3fUJqQ",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbel Russian Twist",
            link: "https://www.youtube.com/watch?v=FShbaqrGGu4",
            type: "timer",
            complete: false
          },
          {
            title: "Knee to Elbow Crunches",
            link: "https://www.youtube.com/watch?v=IqU06UsPp1k",
            type: "timer",
            complete: false
          },
          {
            title: "Crunch",
            link: "https://www.youtube.com/watch?v=KojXAk4lXkE",
            type: "timer",
            complete: false
          },
          {
            title: "Cobras",
            link: "https://www.youtube.com/watch?v=q46qN4ypiFo",
            type: "timer",
            complete: false
          },
          {
            title: "Arm Raises",
            link: "https://www.youtube.com/watch?v=Bqvmyni_sKQ",
            type: "timer",
            complete: false
          },
          {
            title: "Left Side Leg Raise",
            link: "https://www.youtube.com/watch?v=Z_0p0I8B4EU",
            type: "timer",
            complete: false
          },
          {
            title: "Right Side Leg Raise",
            link: "https://www.youtube.com/watch?v=Z_0p0I8B4EU",
            type: "timer",
            complete: false
          },
          {
            title: "Left Split Squat",
            link: "https://www.youtube.com/watch?v=SFSZVKzqnXA",
            type: "timer",
            complete: false
          },
          {
            title: "Right Split Squat",
            link: "https://www.youtube.com/watch?v=SFSZVKzqnXA",
            type: "timer",
            complete: false
          },
          {
            title: "Toy Soldiers",
            link: "https://www.youtube.com/watch?v=6NVowqZQiYQ",
            type: "timer",
            complete: false
          },
          {
            title: "V-Hold",
            link: "https://www.youtube.com/watch?v=WGwI629aTAY",
            type: "timer",
            complete: false
          },
          {
            title: "Left Fire Hydrant",
            link: "https://www.youtube.com/watch?v=7LnuhLi-78I",
            type: "timer",
            complete: false
          },
          {
            title: "Right Fire Hydrant",
            link: "https://www.youtube.com/watch?v=7LnuhLi-78I",
            type: "timer",
            complete: false
          },
          {
            title: "Left Doorway Curls",
            link: "https://www.youtube.com/watch?v=134v7cB-1W8",
            type: "timer",
            complete: false
          },
          {
            title: "Right Doorway Curls",
            link: "https://www.youtube.com/watch?v=134v7cB-1W8",
            type: "timer",
            complete: false
          },
          {
            title: "Crunches with Legs Raised",
            link: "https://www.youtube.com/watch?v=ulSBgyB8evM",
            type: "timer",
            complete: false
          },
          {
            title: "Roundhouse Squat Kicks",
            link: "https://www.youtube.com/watch?v=GfEXIcAaEBM",
            type: "timer",
            complete: false
          },
          {
            title: "Shoulder Stretch",
            link: "https://www.youtube.com/watch?v=9k0EN2RCGgU",
            type: "timer",
            complete: false
          },
          {
            title: "Modified Burpees",
            link: "https://www.youtube.com/watch?v=8PbnMQISmZQ",
            type: "timer",
            complete: false
          },
          {
            title: "Crab Walk",
            link: "https://www.youtube.com/watch?v=OI-3e5Dcm-I",
            type: "timer",
            complete: false
          },
          {
            title: "Pike Pushups",
            link: "https://www.youtube.com/watch?v=Q2koXI9jphI",
            type: "timer",
            complete: false
          },
          {
            title: "Superman",
            link: "https://www.youtube.com/watch?v=pGeaBXLwDtw",
            type: "timer",
            complete: false
          },
          {
            title: "Spiderman Plank",
            link: "https://www.youtube.com/watch?v=G8-vocJfWEM",
            type: "timer",
            complete: false
          },
          {
            title: "Push-Up and Rotation",
            link: "https://www.youtube.com/watch?v=Plv5CIclPtQ",
            type: "timer",
            complete: false
          },
          {
            title: "Dead Bug",
            link: "https://www.youtube.com/watch?v=bXMQkRowNk8",
            type: "timer",
            complete: false
          },
          {
            title: "Adductur Stretch In Standing",
            link: "https://www.youtube.com/watch?v=MjFb2MyaNjs",
            type: "timer",
            complete: false
          },
          {
            title: "Bird Dog",
            link: "https://www.youtube.com/watch?v=v0oCYe8__bU",
            type: "timer",
            complete: false
          },
          {
            title: "Punches",
            link: "https://www.youtube.com/watch?v=reeBHtZJ1ts",
            type: "timer",
            complete: false
          },
          {
            title: "Claps Over Head",
            link: "https://www.youtube.com/watch?v=2i80fjp5saU",
            type: "timer",
            complete: false
          },
          {
            title: "Squat Reach-Ups",
            link: "https://www.youtube.com/watch?v=73Cb-y57UWg",
            type: "timer",
            complete: false
          },
          {
            title: "Jumping Push-Ups",
            link: "https://www.youtube.com/watch?v=SdP5TSgRHPc",
            type: "timer",
            complete: false
          },
          {
            title: "Left Side Leg Circles",
            link: "https://www.youtube.com/watch?v=VgysBPnVJWg",
            type: "timer",
            complete: false
          },
          {
            title: "Right Side Leg Circles",
            link: "https://www.youtube.com/watch?v=VgysBPnVJWg",
            type: "timer",
            complete: false
          },
          {
            title: "Reclined Rhomboid Squeezes",
            link: "https://www.youtube.com/watch?v=olv2Sv9DwmA",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Calf Raises",
            link: "https://www.youtube.com/watch?v=GQa_N7wft7M",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Crossover Toe Touches",
            link: "https://www.youtube.com/watch?v=OUJD4yjr3I4",
            type: "timer",
            complete: false
          },
          {
            title: "Bent Knee Left Side Hip Raises",
            link: "https://www.youtube.com/watch?v=y1SrmOgVJ8I",
            type: "timer",
            complete: false
          },
          {
            title: "Bent Knee Right Side Hip Raises",
            link: "https://www.youtube.com/watch?v=y1SrmOgVJ8I",
            type: "timer",
            complete: false
          },
          {
            title: "Arm Swing with Lateral Steps",
            link: "https://www.youtube.com/watch?v=tLEkdDgTDbM",
            type: "timer",
            complete: false
          },
          {
            title: "Oblique Crunch Reach",
            link: "https://www.youtube.com/watch?v=HilAisRJCgo",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Dumbell Curl",
            link: "https://www.youtube.com/watch?v=CxM4wKfus_Y",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Reverse Curl",
            link: "https://www.youtube.com/watch?v=vM40o2TiJfM",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Torture Tucks",
            link: "https://www.youtube.com/watch?v=K0Sonq8jz3M",
            type: "timer",
            complete: false
          },
          {
            title: "Reverse Push-Ups",
            link: "https://www.youtube.com/watch?v=XRpbVcpx-Yc",
            type: "timer",
            complete: false
          },
          {
            title: "Prone Flutter kicks",
            link: "https://www.youtube.com/watch?v=9i0J_I4ASow",
            type: "timer",
            complete: false
          },
          {
            title: "1-Down 2-Ups",
            link: "https://www.youtube.com/watch?v=f9c28wuQyQM",
            type: "timer",
            complete: false
          },
          {
            title: "Back Bow Pulls",
            link: "https://www.youtube.com/watch?v=GvyCtKvmaVE",
            type: "timer",
            complete: false
          },
          {
            title: "Sumo Squat",
            link: "https://www.youtube.com/watch?v=Z2F0bArQH5s",
            type: "timer",
            complete: false
          },
          {
            title: "Frog Press",
            link: "https://www.youtube.com/watch?v=JvA7t9xKWgg",
            type: "timer",
            complete: false
          },
          {
            title: "Lunge Left Knee Hops",
            link: "https://www.youtube.com/watch?v=NSy3QKsZ7uI",
            type: "timer",
            complete: false
          },
          {
            title: "Lunge Right Knee Hops",
            link: "https://www.youtube.com/watch?v=NSy3QKsZ7uI",
            type: "timer",
            complete: false
          },
          {
            title: "Skater Jump",
            link: "https://www.youtube.com/watch?v=5gtLC5BgN7Q",
            type: "timer",
            complete: false
          },
          {
            title: "Jumping Squats",
            link: "https://www.youtube.com/watch?v=txLE-jOCEsc",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Kickbacks",
            link: "https://www.youtube.com/watch?v=3ao9J4vvEXA",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Crunches",
            link: "https://www.youtube.com/watch?v=wngf6BI012Y",
            type: "timer",
            complete: false
          },
          {
            title: "Left Glute Stretch",
            link: "https://www.youtube.com/watch?v=vSKSU8KDc38",
            type: "timer",
            complete: false
          },
          {
            title: "Right Glute Stretch",
            link: "https://www.youtube.com/watch?v=vSKSU8KDc38",
            type: "timer",
            complete: false
          },
          {
            title: "Left Calf Stretch",
            link: "https://www.youtube.com/watch?v=mJOGKTYUAzY",
            type: "timer",
            complete: false
          },
          {
            title: "Right Calf Stretch",
            link: "https://www.youtube.com/watch?v=mJOGKTYUAzY",
            type: "timer",
            complete: false
          },
          {
            title: "Side Step Jacks",
            link: "https://www.youtube.com/watch?v=p75NmUtH9so",
            type: "timer",
            complete: false
          },
          {
            title: "Decline Pushups",
            link: "https://www.youtube.com/watch?v=OjPfLfLsw3c",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Paddle Boats",
            link: "https://www.youtube.com/watch?v=PZLb4_ymTwA",
            type: "timer",
            complete: false
          },
          {
            title: "Scissors",
            link: "https://www.youtube.com/watch?v=2cc_hUFvTKU",
            type: "timer",
            complete: false
          },
          {
            title: "Double Knees To Chest",
            link: "https://www.youtube.com/watch?v=R4hV4xrJNqc",
            type: "timer",
            complete: false
          },
          {
            title: "Flutter kick Squats",
            link: "https://www.youtube.com/watch?v=8zJh1tGtldU",
            type: "timer",
            complete: false
          },
          {
            title: "Cross Body Mountain Climber",
            link: "https://www.youtube.com/watch?v=tIEkB8S42j8",
            type: "timer",
            complete: false
          },
          {
            title: "Zottman Curl",
            link: "https://www.youtube.com/watch?v=d69IO-dO2pc",
            type: "timer",
            complete: false
          },
          {
            title: "Kneeling Left Lunge Stretch",
            link: "https://www.youtube.com/watch?v=3wthmvKWoOU",
            type: "timer",
            complete: false
          },
          {
            title: "Kneeling Right Lunge Stretch",
            link: "https://www.youtube.com/watch?v=3wthmvKWoOU",
            type: "timer",
            complete: false
          },
          {
            title: "Step-Up on to Chair",
            link: "https://www.youtube.com/watch?v=XNpkt8s9r2w",
            type: "timer",
            complete: false
          },
          {
            title: "Straight Arm Plank to Pike",
            link: "https://www.youtube.com/watch?v=d_B55dng_bs",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Pullover on Floor",
            link: "https://www.youtube.com/watch?v=a3cF2sS5v6I",
            type: "timer",
            complete: false
          },
          {
            title: "Downward Facing Dog to the Wall",
            link: "https://www.youtube.com/watch?v=rto2xsfqWx8",
            type: "timer",
            complete: false
          },
          {
            title: "T-Plank Left",
            link: "https://www.youtube.com/watch?v=rTY5mqJ1HNo",
            type: "timer",
            complete: false
          },
          {
            title: "T-Plank Right",
            link: "https://www.youtube.com/watch?v=rTY5mqJ1HNo",
            type: "timer",
            complete: false
          },
          {
            title: "Cat Cow Pose",
            link: "https://www.youtube.com/watch?v=w_UKcI1Ftn8",
            type: "timer",
            complete: false
          },
          {
            title: "Plank Hip Dips",
            link: "https://www.youtube.com/watch?v=h1_Y3GBUd0M",
            type: "timer",
            complete: false
          },
          {
            title: "Windshield Wipers",
            link: "https://www.youtube.com/watch?v=fNf_IfTAVD0",
            type: "timer",
            complete: false
          },
          {
            title: "Left Glute Kickback",
            link: "https://www.youtube.com/watch?v=D4gxkgZQkAg",
            type: "timer",
            complete: false
          },
          {
            title: "Right Glute Kickback",
            link: "https://www.youtube.com/watch?v=D4gxkgZQkAg",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Knee To Chest",
            link: "https://www.youtube.com/watch?v=uC7dzhqN47M",
            type: "timer",
            complete: false
          },
          {
            title: "Bridge",
            link: "https://www.youtube.com/watch?v=-KKADnBsPzw",
            type: "timer",
            complete: false
          },
          {
            title: "Fast Spider Lunges",
            link: "https://www.youtube.com/watch?v=M_OoFzysWak",
            type: "timer",
            complete: false
          },
          {
            title: "Bulgarian Split Squat Left",
            link: "https://www.youtube.com/watch?v=Brh1SHAkknI",
            type: "timer",
            complete: false
          },
          {
            title: "Bulgarian Split Squat Right",
            link: "https://www.youtube.com/watch?v=Brh1SHAkknI",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Sit",
            link: "https://www.youtube.com/watch?v=Yp3ZwACK9v4",
            type: "timer",
            complete: false
          },
          {
            title: "Shoulder Outward Rotation",
            link: "https://www.youtube.com/watch?v=q_uOqXQhBq4",
            type: "timer",
            complete: false
          },
          {
            title: "Reverse Flys",
            link: "https://www.youtube.com/watch?v=Cu57U1AqCBk",
            type: "timer",
            complete: false
          },
          {
            title: "Hyperextension",
            link: "https://www.youtube.com/watch?v=W9y8xq4Ya_E",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Left Glute Kickbacks",
            link: "https://www.youtube.com/watch?v=pn2EZjEE_ZU",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Right Glute Kickbacks",
            link: "https://www.youtube.com/watch?v=pn2EZjEE_ZU",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Triceps Extension",
            link: "https://www.youtube.com/watch?v=a1Uanj_vaYA",
            type: "timer",
            complete: false
          },
          {
            title: "Bottom Left Leg Lift",
            link: "https://www.youtube.com/watch?v=Dm1GSX1vItY",
            type: "timer",
            complete: false
          },
          {
            title: "Bottom Right Leg Lift",
            link: "https://www.youtube.com/watch?v=Dm1GSX1vItY",
            type: "timer",
            complete: false
          },
          {
            title: "Seated Left Side Bend",
            link: "https://www.youtube.com/watch?v=jKcHh78Y_JE",
            type: "timer",
            complete: false
          },
          {
            title: "Seated Right Side Bend",
            link: "https://www.youtube.com/watch?v=jKcHh78Y_JE",
            type: "timer",
            complete: false
          },
          {
            title: "Hip Bridge and Left Leg Lift",
            link: "https://www.youtube.com/watch?v=_pDhLWYEC18",
            type: "timer",
            complete: false
          },
          {
            title: "Hip Bridge and Right Leg Lift",
            link: "https://www.youtube.com/watch?v=_pDhLWYEC18",
            type: "timer",
            complete: false
          },
          {
            title: "Bench Left Glute Kickback",
            link: "https://www.youtube.com/watch?v=Mi4H6YUVMCQ",
            type: "timer",
            complete: false
          },
          {
            title: "Bench Right Glute Kickback",
            link: "https://www.youtube.com/watch?v=Mi4H6YUVMCQ",
            type: "timer",
            complete: false
          },
          {
            title: "Plank Leg Up",
            link: "https://www.youtube.com/watch?v=O9j5_BriCW4",
            type: "timer",
            complete: false
          },
          {
            title: "Slow Mountain Climber",
            link: "https://www.youtube.com/watch?v=YZstn7BkgvU",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Bicycle Passes",
            link: "https://www.youtube.com/watch?v=WfL6YEINfV8",
            type: "timer",
            complete: false
          },
          {
            title: "Left Quad Stretch With Wall",
            link: "https://www.youtube.com/watch?v=TfcRyYf7WLg",
            type: "timer",
            complete: false
          },
          {
            title: "Right Quad Stretch With Wall",
            link: "https://www.youtube.com/watch?v=TfcRyYf7WLg",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Punch",
            link: "https://www.youtube.com/watch?v=NyOGzlXqa8g",
            type: "timer",
            complete: false
          },
          {
            title: "Quick Feet",
            link: "https://www.youtube.com/watch?v=fz59j4a3QMQ",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Close Grip Floor Press",
            link: "https://www.youtube.com/watch?v=gDO6U_C1ktE",
            type: "timer",
            complete: false
          },
          {
            title: "Quad Stretch",
            link: "https://www.youtube.com/watch?v=WFtPk4Z-k60",
            type: "timer",
            complete: false
          },
          {
            title: "Palates Clamshell Left",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          },
          {
            title: "Palates Clamshell Right",
            link: "https://www.youtube.com/watch?v=mYMardCrLSk",
            type: "timer",
            complete: false
          },
          {
            title: "Left Knee to Chest Stretch",
            link: "https://www.youtube.com/watch?v=bJms9YyjoBI",
            type: "timer",
            complete: false
          },
          {
            title: "Right Knee to Chest Stretch",
            link: "https://www.youtube.com/watch?v=bJms9YyjoBI",
            type: "timer",
            complete: false
          },
          {
            title: "Seated Butterfly Stretch",
            link: "https://www.youtube.com/watch?v=QehQaZvvquA",
            type: "timer",
            complete: false
          },
          {
            title: "Overhead Arm Circles",
            link: "https://www.youtube.com/watch?v=wZVO6ZnARIE",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Left Donkey Kicks",
            link: "https://www.youtube.com/watch?v=pd3KyzQS5nc",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Right Donkey Kicks",
            link: "https://www.youtube.com/watch?v=pd3KyzQS5nc",
            type: "timer",
            complete: false
          },
          {
            title: "Hip Hinge",
            link: "https://www.youtube.com/watch?v=VyFDPMOy-eA",
            type: "timer",
            complete: false
          },
          {
            title: "Reverse Flutter Kicks",
            link: "https://www.youtube.com/watch?v=UsO66ZUvzb0",
            type: "timer",
            complete: false
          },
          {
            title: "Clasp Hands Behind Back",
            link: "https://www.youtube.com/watch?v=JoxGFxbgJ2Y",
            type: "timer",
            complete: false
          },
          {
            title: "Offset Pushups",
            link: "https://www.youtube.com/watch?v=32yYCbAQo5A",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Left Toe-Touch Crunch",
            link: "https://www.youtube.com/watch?v=maPIOGXENjs",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Right Toe-Touch Crunch",
            link: "https://www.youtube.com/watch?v=maPIOGXENjs",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Left Calf Hop",
            link: "https://www.youtube.com/watch?v=oeVFHaGmVM8",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Right Calf Hop",
            link: "https://www.youtube.com/watch?v=oeVFHaGmVM8",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Upright-Row",
            link: "https://www.youtube.com/watch?v=8ywEQiJuBNg",
            type: "timer",
            complete: false
          },
          {
            title: "Leaning Stretcher Raises",
            link: "https://www.youtube.com/watch?v=qQ-StR-AXzM",
            type: "timer",
            complete: false
          },
          {
            title: "Overhead Triceps Extension",
            link: "https://www.youtube.com/watch?v=-9Uup5bhPBI",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Resisting Single Leg Left Calf Raise",
            link: "https://www.youtube.com/watch?v=795rPzSVOd4",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Resisting Single Leg Right Calf Raise",
            link: "https://www.youtube.com/watch?v=795rPzSVOd4",
            type: "timer",
            complete: false
          },
          {
            title: "Triangle Pose Left",
            link: "https://www.youtube.com/watch?v=qOYy5m3rr1s",
            type: "timer",
            complete: false
          },
          {
            title: "Triangle Pose Right",
            link: "https://www.youtube.com/watch?v=qOYy5m3rr1s",
            type: "timer",
            complete: false
          },
          {
            title: "Butterfly Bridge",
            link: "https://www.youtube.com/watch?v=sJC_fMOVZVw",
            type: "timer",
            complete: false
          },
          {
            title: "In and Out Planks",
            link: "https://www.youtube.com/watch?v=clsucWwp5Oc",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Hip Rotation",
            link: "https://www.youtube.com/watch?v=v_OyHGNxTzU",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Lying Triceps Extension",
            link: "https://www.youtube.com/watch?v=FyBXas1QUWo",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Side Bend",
            link: "https://www.youtube.com/watch?v=RfuiraEgKcY",
            type: "timer",
            complete: false
          },
          {
            title: "Kneeling Left Side Plank",
            link: "https://www.youtube.com/watch?v=ZAr0nJn8WPQ",
            type: "timer",
            complete: false
          },
          {
            title: "Kneeling Right Side Plank",
            link: "https://www.youtube.com/watch?v=ZAr0nJn8WPQ",
            type: "timer",
            complete: false
          },
          {
            title: "Calf Raise Pidgeon-Toed",
            link: "https://www.youtube.com/watch?v=9p_GzSpzlRk",
            type: "timer",
            complete: false
          },
          {
            title: "Calf Raise Splay-Foot",
            link: "https://www.youtube.com/watch?v=wcMPalYWlpg",
            type: "timer",
            complete: false
          },
          {
            title: "Cross Touch and Reach",
            link: "https://www.youtube.com/watch?v=tTrk6Kzo2OA",
            type: "timer",
            complete: false
          },
          {
            title: "Biceps Curls",
            link: "https://www.youtube.com/watch?v=65gMtswVB1c",
            type: "timer",
            complete: false
          },
          {
            title: "Oblique Left Crossover Crunch",
            link: "https://www.youtube.com/watch?v=LATqsI5q0hc",
            type: "timer",
            complete: false
          },
          {
            title: "Oblique Right Crossover Crunch",
            link: "https://www.youtube.com/watch?v=LATqsI5q0hc",
            type: "timer",
            complete: false
          },
          {
            title: "Cross Body Hammer Curl",
            link: "https://www.youtube.com/watch?v=uBSgMtuxnv0",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Wide Bicep Curls",
            link: "https://www.youtube.com/watch?v=pB4Iic8p6Ag",
            type: "timer",
            complete: false
          },
          {
            title: "Wrist and Left Ankle Stretch",
            link: "https://www.youtube.com/watch?v=oVyhNRtXIio",
            type: "timer",
            complete: false
          },
          {
            title: "Wrist and Right Ankle Stretch",
            link: "https://www.youtube.com/watch?v=oVyhNRtXIio",
            type: "timer",
            complete: false
          },
          {
            title: "Starfish Crunch",
            link: "https://www.youtube.com/watch?v=CoTLqNsivCI",
            type: "timer",
            complete: false
          },
          {
            title: "Left Backward Lunge With Front Kick",
            link: "https://www.youtube.com/watch?v=g7pZDrp0IdU",
            type: "timer",
            complete: false
          },
          {
            title: "Right Backward Lunge With Front Kick",
            link: "https://www.youtube.com/watch?v=g7pZDrp0IdU",
            type: "timer",
            complete: false
          },
          {
            title: "Left Dumbell Concentration Curl",
            link: "https://www.youtube.com/watch?v=a6VgtO2ZOwM",
            type: "timer",
            complete: false
          },
          {
            title: "Right Dumbell Concentration Curl",
            link: "https://www.youtube.com/watch?v=a6VgtO2ZOwM",
            type: "timer",
            complete: false
          },
          {
            title: "Squat Kicks",
            link: "https://www.youtube.com/watch?v=vflAcwPOQbk",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Left Calf Raises",
            link: "https://www.youtube.com/watch?v=xVb3rW0a7Fw",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Right Calf Raises",
            link: "https://www.youtube.com/watch?v=xVb3rW0a7Fw",
            type: "timer",
            complete: false
          },
          {
            title: "Squat Thrust with Twist",
            link: "https://www.youtube.com/watch?v=OfwqSK_Ghvk",
            type: "timer",
            complete: false
          },
          {
            title: "Bent Over Row",
            link: "https://www.youtube.com/watch?v=t2DUqP_13x8",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Up-N-Overs",
            link: "https://www.youtube.com/watch?v=mDq3uINkKm0",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Left Side Bend",
            link: "https://www.youtube.com/watch?v=E1amGLJEqpU",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Right Side Bend",
            link: "https://www.youtube.com/watch?v=E1amGLJEqpU",
            type: "timer",
            complete: false
          },
          {
            title: "Floor Slides",
            link: "https://www.youtube.com/watch?v=Cft0lko4M4s",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Drops",
            link: "https://www.youtube.com/watch?v=PQoc7rkNiGI",
            type: "timer",
            complete: false
          },
          {
            title: "Squat Jacks",
            link: "https://www.youtube.com/watch?v=tcgvAxhEhvQ",
            type: "timer",
            complete: false
          },
          {
            title: "Seated In-N-Outs",
            link: "https://www.youtube.com/watch?v=d1CaYcMApDw",
            type: "timer",
            complete: false
          },
          {
            title: "Seated Spinal Twist Left",
            link: "https://www.youtube.com/watch?v=4YlCtaTdtgA",
            type: "timer",
            complete: false
          },
          {
            title: "Seated Spinal Twist Right",
            link: "https://www.youtube.com/watch?v=4YlCtaTdtgA",
            type: "timer",
            complete: false
          },
          {
            title: "Alternate Hammer Curl",
            link: "https://www.youtube.com/watch?v=L1bDrPlfu1Q",
            type: "timer",
            complete: false
          },
          {
            title: "Bicep Curls",
            link: "https://www.youtube.com/watch?v=896qScV6qi4",
            type: "timer",
            complete: false
          },
          {
            title: "Side Plank Left Knee Crunch",
            link: "https://www.youtube.com/watch?v=Ds85Xw3qq9c",
            type: "timer",
            complete: false
          },
          {
            title: "Side Plank Right Knee Crunch",
            link: "https://www.youtube.com/watch?v=Ds85Xw3qq9c",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Seated In-N-Outs",
            link: "https://www.youtube.com/watch?v=dFqJpeDO7R0",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Chest Fly",
            link: "https://www.youtube.com/watch?v=7uvFOUA4gsY",
            type: "timer",
            complete: false
          },
          {
            title: "Straight Left Leg Raise",
            link: "https://www.youtube.com/watch?v=cyGrjzTbvKs",
            type: "timer",
            complete: false
          },
          {
            title: "Straight Right Leg Raise",
            link: "https://www.youtube.com/watch?v=cyGrjzTbvKs",
            type: "timer",
            complete: false
          },
          {
            title: "Left Side Lying Kickback",
            link: "https://www.youtube.com/watch?v=OXC39VmkhcE",
            type: "timer",
            complete: false
          },
          {
            title: "Right Side Lying Kickback",
            link: "https://www.youtube.com/watch?v=OXC39VmkhcE",
            type: "timer",
            complete: false
          },
          {
            title: "Left Glute Kickback Pulse",
            link: "https://www.youtube.com/watch?v=Lxdu7Nlp6KE",
            type: "timer",
            complete: false
          },
          {
            title: "Right Glute Kickback Pulse",
            link: "https://www.youtube.com/watch?v=Lxdu7Nlp6KE",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Crunch and Punches",
            link: "https://www.youtube.com/watch?v=j19klieazl0",
            type: "timer",
            complete: false
          },
          {
            title: "Arm Swings",
            link: "https://www.youtube.com/watch?v=dW3Pi-RXSyM",
            type: "timer",
            complete: false
          },
          {
            title: "Plank and Reach",
            link: "https://www.youtube.com/watch?v=PqUi-H1edcE",
            type: "timer",
            complete: false
          },
          {
            title: "Clockwise Shoulder Rolls",
            link: "https://www.youtube.com/watch?v=Uf0MKHeT67c",
            type: "timer",
            complete: false
          },
          {
            title: "Lying Knee Hug",
            link: "https://www.youtube.com/watch?v=tT7W-F28TXo",
            type: "timer",
            complete: false
          },
          {
            title: "Hops on the Spot",
            link: "https://www.youtube.com/watch?v=ImamH6J566s",
            type: "timer",
            complete: false
          },
          {
            title: "Anterior Shoulder Stretch",
            link: "https://www.youtube.com/watch?v=s8C3OmS82qw",
            type: "timer",
            complete: false
          },
          {
            title: "Pistol Box Squat Left",
            link: "https://www.youtube.com/watch?v=N94KPKoK8ls",
            type: "timer",
            complete: false
          },
          {
            title: "Pistol Box Squat Right",
            link: "https://www.youtube.com/watch?v=N94KPKoK8ls",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Side Lunges",
            link: "https://www.youtube.com/watch?v=gKcUhmLbEIY",
            type: "timer",
            complete: false
          },
          {
            title: "Military Press",
            link: "https://www.youtube.com/watch?v=pNa0_QN2eUg",
            type: "timer",
            complete: false
          },
          {
            title: "X-Burpees",
            link: "https://www.youtube.com/watch?v=uD5BUL79CvY",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Plank Rotation",
            link: "https://www.youtube.com/watch?v=QlwR1Sd57bM",
            type: "timer",
            complete: false
          },
          {
            title: "Left Elbow Plank Rotation",
            link: "https://www.youtube.com/watch?v=fu6-teFilJk",
            type: "timer",
            complete: false
          },
          {
            title: "Right Elbow Plank Rotation",
            link: "https://www.youtube.com/watch?v=fu6-teFilJk",
            type: "timer",
            complete: false
          },
          {
            title: "Trunk Rotation",
            link: "https://www.youtube.com/watch?v=YBgjuQMviCE",
            type: "timer",
            complete: false
          },
          {
            title: "Walking Squats",
            link: "https://www.youtube.com/watch?v=ZS75FSLSIR8",
            type: "timer",
            complete: false
          },
          {
            title: "Bentover Dumbell Rows Left",
            link: "https://www.youtube.com/watch?v=6YfpfLvUa5w",
            type: "timer",
            complete: false
          },
          {
            title: "Bentover Dumbell Rows Right",
            link: "https://www.youtube.com/watch?v=6YfpfLvUa5w",
            type: "timer",
            complete: false
          },
          {
            title: "Tip Toe Squats",
            link: "https://www.youtube.com/watch?v=T5Xgc02T2Dw",
            type: "timer",
            complete: false
          },
          {
            title: "High Knee With Twist",
            link: "https://www.youtube.com/watch?v=nO9zzuLfHL4",
            type: "timer",
            complete: false
          },
          {
            title: "Sumo Squat Leg Raises",
            link: "https://www.youtube.com/watch?v=by8bvR0r178",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Left Side Boat Hold",
            link: "https://www.youtube.com/watch?v=BszZ8i6bn1A",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Right Side Boat Hold",
            link: "https://www.youtube.com/watch?v=BszZ8i6bn1A",
            type: "timer",
            complete: false
          },
          {
            title: "Oblique Crunch Reach",
            link: "https://www.youtube.com/watch?v=Z9WtuN50f9s",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Decline Floor Press",
            link: "https://www.youtube.com/watch?v=kBDMTp1-iTw",
            type: "timer",
            complete: false
          },
          {
            title: "Left Donkey Kicks Pulse",
            link: "https://www.youtube.com/watch?v=QaTh15GsgHk",
            type: "timer",
            complete: false
          },
          {
            title: "Right Donkey Kicks Pulse",
            link: "https://www.youtube.com/watch?v=QaTh15GsgHk",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Fire Hydrant Left",
            link: "https://www.youtube.com/watch?v=kVpYYhzJTqE",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Fire Hydrant Right",
            link: "https://www.youtube.com/watch?v=kVpYYhzJTqE",
            type: "timer",
            complete: false
          },
          {
            title: "Sitting Left Hamstring Stretch",
            link: "https://www.youtube.com/watch?v=ZGEPDiRpdm0",
            type: "timer",
            complete: false
          },
          {
            title: "Sitting Right Hamstring Stretch",
            link: "https://www.youtube.com/watch?v=ZGEPDiRpdm0",
            type: "timer",
            complete: false
          },
          {
            title: "Torso Twist",
            link: "https://www.youtube.com/watch?v=HMKbmG1L7vc",
            type: "timer",
            complete: false
          },
          {
            title: "Glute Kick Back",
            link: "https://www.youtube.com/watch?v=58msQFam5Ew",
            type: "timer",
            complete: false
          },
          {
            title: "Pendulum Swing",
            link: "https://www.youtube.com/watch?v=RN2qWm0f3eM",
            type: "timer",
            complete: false
          },
          {
            title: "Straight Left Leg Fire Hydrant",
            link: "https://www.youtube.com/watch?v=OTbaDN08Yac",
            type: "timer",
            complete: false
          },
          {
            title: "Straight Right Leg Fire Hydrant",
            link: "https://www.youtube.com/watch?v=OTbaDN08Yac",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Bench Press",
            link: "https://www.youtube.com/watch?v=GrmETJwvBgY",
            type: "timer",
            complete: false
          },
          {
            title: "Crab Kicks",
            link: "https://www.youtube.com/watch?v=4DZzw1Rc-9Y",
            type: "timer",
            complete: false
          },
          {
            title: "Cross Leg Left Side Bend",
            link: "https://www.youtube.com/watch?v=mY0uoK8_8AQ",
            type: "timer",
            complete: false
          },
          {
            title: "Cross Leg Right Side Bend",
            link: "https://www.youtube.com/watch?v=mY0uoK8_8AQ",
            type: "timer",
            complete: false
          },
          {
            title: "Sumo Squat Calf Raises",
            link: "https://www.youtube.com/watch?v=GD5IaDVlGhA",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Bent Leg Twist",
            link: "https://www.youtube.com/watch?v=oOd7FLthrbk",
            type: "timer",
            complete: false
          },
          {
            title: "Valley Press",
            link: "https://www.youtube.com/watch?v=Az3ZkQzc2pU",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Left Arm Triceps Kick Back",
            link: "https://www.youtube.com/watch?v=zfnWQVmDspU",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Right Arm Triceps Kick Back",
            link: "https://www.youtube.com/watch?v=zfnWQVmDspU",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Standing Left Hip Abduction",
            link: "https://www.youtube.com/watch?v=d4XF8LD_ZVQ",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Standing Right Hip Abduction",
            link: "https://www.youtube.com/watch?v=d4XF8LD_ZVQ",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Reverse Crunches",
            link: "https://www.youtube.com/watch?v=kcKW6TOIMtk",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Front Raise",
            link: "https://www.youtube.com/watch?v=1GG7dkTrBEk",
            type: "timer",
            complete: false
          },
          {
            title: "Up & Down Nods",
            link: "https://www.youtube.com/watch?v=8QyMRoSZM8c",
            type: "timer",
            complete: false
          },
          {
            title: "Push-Up With Toe Tap",
            link: "https://www.youtube.com/watch?v=YrlXZPNDo3A",
            type: "timer",
            complete: false
          },
          {
            title: "Arnold Dumbell Press",
            link: "https://www.youtube.com/watch?v=at9pnhR2cFM",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Hip Hinge",
            link: "https://www.youtube.com/watch?v=yac3o7xnA4s",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell V-Up",
            link: "https://www.youtube.com/watch?v=Gas9T9-LtHU",
            type: "timer",
            complete: false
          },
          {
            title: "Body Saw",
            link: "https://www.youtube.com/watch?v=CJHdCRhZCwY",
            type: "timer",
            complete: false
          },
          {
            title: "Supine Left Hamstring Stretch",
            link: "https://www.youtube.com/watch?v=aRZeX88VRLc",
            type: "timer",
            complete: false
          },
          {
            title: "Supine Right Hamstring Stretch",
            link: "https://www.youtube.com/watch?v=aRZeX88VRLc",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Glute Left Kickback Hold",
            link: "https://www.youtube.com/watch?v=jWDHafNF3kQ",
            type: "timer",
            complete: false
          },
          {
            title: "Wall Glute Right Kickback Hold",
            link: "https://www.youtube.com/watch?v=jWDHafNF3kQ",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Boat Hold",
            link: "https://www.youtube.com/watch?v=wm7g8UoTZj4",
            type: "timer",
            complete: false
          },
          {
            title: "Forward Bend",
            link: "https://www.youtube.com/watch?v=IrCe1H0OOMA",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Single Leg Left Hip Thrust",
            link: "https://www.youtube.com/watch?v=Jw_rJ6l3aRY",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Single Leg Right Hip Thrust",
            link: "https://www.youtube.com/watch?v=Jw_rJ6l3aRY",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Side Lateral Raise",
            link: "https://www.youtube.com/watch?v=6L19uhg2otQ",
            type: "timer",
            complete: false
          },
          {
            title: "Downward Facing Dog",
            link: "https://www.youtube.com/watch?v=ahBd-oI76Zs",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Close Grip Bench Press",
            link: "https://www.youtube.com/watch?v=kQoVg8dUB6Y",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Cuban Rotation",
            link: "https://www.youtube.com/watch?v=voe9vZ0Yjlk",
            type: "timer",
            complete: false
          },
          {
            title: "Legs Up the Wall",
            link: "https://www.youtube.com/watch?v=7xg7CY17ly0",
            type: "timer",
            complete: false
          },
          {
            title: "Leg Spreads",
            link: "https://www.youtube.com/watch?v=aZRDySUyC1I",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Bicep Curl To Press",
            link: "https://www.youtube.com/watch?v=9C5EtvkK6k4",
            type: "timer",
            complete: false
          },
          {
            title: "Shoulder Stretch With Chair",
            link: "https://www.youtube.com/watch?v=1McKjXfOIJ4",
            type: "timer",
            complete: false
          },
          {
            title: "Alternating Renegade Row",
            link: "https://www.youtube.com/watch?v=KvoHxslZun0",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbel Hamstring Curl",
            link: "https://www.youtube.com/watch?v=0dO19gUYGyc",
            type: "timer",
            complete: false
          },
          {
            title: "Left Side Lying Forward Leg Lift",
            link: "https://www.youtube.com/watch?v=rrs0mzQSMQI",
            type: "timer",
            complete: false
          },
          {
            title: "Right Side Lying Forward Leg Lift",
            link: "https://www.youtube.com/watch?v=rrs0mzQSMQI",
            type: "timer",
            complete: false
          },
          {
            title: "Left Lying Dumbell Lateral Raise",
            link: "https://www.youtube.com/watch?v=Y6CIPU0uqdY",
            type: "timer",
            complete: false
          },
          {
            title: "Right Lying Dumbell Lateral Raise",
            link: "https://www.youtube.com/watch?v=Y6CIPU0uqdY",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Hip Curl",
            link: "https://www.youtube.com/watch?v=4-OTUubpEMU",
            type: "timer",
            complete: false
          },
          {
            title: "Mountain Climber Squat Thrust",
            link: "https://www.youtube.com/watch?v=K0R4snqCbRA",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Pullover",
            link: "https://www.youtube.com/watch?v=FCogymf_XK0",
            type: "timer",
            complete: false
          },
          {
            title: "Left Leg Lateral Raise",
            link: "https://www.youtube.com/watch?v=q2bnescnSWg",
            type: "timer",
            complete: false
          },
          {
            title: "Right Leg Lateral Raise",
            link: "https://www.youtube.com/watch?v=q2bnescnSWg",
            type: "timer",
            complete: false
          },
          {
            title: "Left Side Plank Front Kick",
            link: "https://www.youtube.com/watch?v=rhxDpDg7XNM",
            type: "timer",
            complete: false
          },
          {
            title: "Right Side Plank Front Kick",
            link: "https://www.youtube.com/watch?v=rhxDpDg7XNM",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Fly To Close Grip Press",
            link: "https://www.youtube.com/watch?v=hJo-BOz_rfw",
            type: "timer",
            complete: false
          },
          {
            title: "Havyk Raises",
            link: "https://www.youtube.com/watch?v=HTSdBBXRR6I",
            type: "timer",
            complete: false
          },
          {
            title: "Air Cycling",
            link: "https://www.youtube.com/watch?v=YRnePgJ7fLQ",
            type: "timer",
            complete: false
          },
          {
            title: "Alternating Dumbell Shoulder Press",
            link: "https://www.youtube.com/watch?v=2OpSgEwaguk",
            type: "timer",
            complete: false
          },
          {
            title: "Quarter Wall Squat",
            link: "https://www.youtube.com/watch?v=SX5XkYWSmfQ",
            type: "timer",
            complete: false
          },
          {
            title: "Slow Mountain Climber",
            link: "https://www.youtube.com/watch?v=24gpL7t4iPY",
            type: "timer",
            complete: false
          },
          {
            title: "Open Chain Left Knee Extension",
            link: "https://www.youtube.com/watch?v=rVOKNDLdMVs",
            type: "timer",
            complete: false
          },
          {
            title: "Open Chain Right Knee Extension",
            link: "https://www.youtube.com/watch?v=rVOKNDLdMVs",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Single Left Arm Otis Up",
            link: "https://www.youtube.com/watch?v=sQbtGNsAcl4",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Single Right Arm Otis Up",
            link: "https://www.youtube.com/watch?v=sQbtGNsAcl4",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Floor Fly To Close Grip Press",
            link: "https://www.youtube.com/watch?v=YcVRQr5xQLk",
            type: "timer",
            complete: false
          },
          {
            title: "Push-Up Row",
            link: "https://www.youtube.com/watch?v=DpsHmYX3Ifg",
            type: "timer",
            complete: false
          },
          {
            title: "The Roll",
            link: "https://www.youtube.com/watch?v=Be0SH5OCFxo",
            type: "timer",
            complete: false
          },
          {
            title: "One Leg Bridge",
            link: "https://www.youtube.com/watch?v=ZgvzRn-16zI",
            type: "timer",
            complete: false
          },
          {
            title: "Left Fire Hydrant Pulse",
            link: "https://www.youtube.com/watch?v=uILAw7D7fxE",
            type: "timer",
            complete: false
          },
          {
            title: "Right Fire Hydrant Pulse",
            link: "https://www.youtube.com/watch?v=uILAw7D7fxE",
            type: "timer",
            complete: false
          },
          {
            title: "Half Bending Pushing Forward",
            link: "https://www.youtube.com/watch?v=ABSbePQDruk",
            type: "timer",
            complete: false
          },
          {
            title: "Ski Squat & Leg Lift",
            link: "https://www.youtube.com/watch?v=YvnjgPq3EZc",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Reverse Curl",
            link: "https://www.youtube.com/watch?v=t1BBTqAXKrI",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Glute Kickbacks",
            link: "https://www.youtube.com/watch?v=GucHQvB4Bbk",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Floor Press",
            link: "https://www.youtube.com/watch?v=2NbOwF_mJ2g",
            type: "timer",
            complete: false
          },
          {
            title: "Lunge Knee Hops",
            link: "https://www.youtube.com/watch?v=VSgej87ULzU",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Curtsy Lunges",
            link: "https://www.youtube.com/watch?v=6W3QCGMYLas",
            type: "timer",
            complete: false
          },
          {
            title: "Crab Kick-Up",
            link: "https://www.youtube.com/watch?v=Emknib0y_J4",
            type: "timer",
            complete: false
          },
          {
            title: "Run On the Wall",
            link: "https://www.youtube.com/watch?v=Vvuj9R-w6a4",
            type: "timer",
            complete: false
          },
          {
            title: "Double Chop Knee-Ups",
            link: "https://www.youtube.com/watch?v=DOFz40sjdmo",
            type: "timer",
            complete: false
          },
          {
            title: "Left Dumbell Woodchop",
            link: "https://www.youtube.com/watch?v=0NgGSvU3ftM",
            type: "timer",
            complete: false
          },
          {
            title: "Right Dumbell Woodchop",
            link: "https://www.youtube.com/watch?v=0NgGSvU3ftM",
            type: "timer",
            complete: false
          },
          {
            title: "Toe Tap",
            link: "https://www.youtube.com/watch?v=SmsSb_DlOwo",
            type: "timer",
            complete: false
          },
          {
            title: "Single Left Arm Renegade Row",
            link: "https://www.youtube.com/watch?v=m0KEk-Y4iII",
            type: "timer",
            complete: false
          },
          {
            title: "Single Right Arm Renegade Row",
            link: "https://www.youtube.com/watch?v=m0KEk-Y4iII",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Left Deadlift",
            link: "https://www.youtube.com/watch?v=_UB6Tp8fzEQ",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Left Deadlift",
            link: "https://www.youtube.com/watch?v=_UB6Tp8fzEQ",
            type: "timer",
            complete: false
          },
          {
            title: "Left Knee Lift",
            link: "https://www.youtube.com/watch?v=4IsQwLnHkkk",
            type: "timer",
            complete: false
          },
          {
            title: "Right Knee Lift",
            link: "https://www.youtube.com/watch?v=4IsQwLnHkkk",
            type: "timer",
            complete: false
          },
          {
            title: "Straight Leg Bounds",
            link: "https://www.youtube.com/watch?v=EX2aYLIicfI",
            type: "timer",
            complete: false
          },
          {
            title: "Leaning Dumbell One Leg Left Calf Raise",
            link: "https://www.youtube.com/watch?v=0Fzgo2Votrc",
            type: "timer",
            complete: false
          },
          {
            title: "Leaning Dumbell One Leg Right Calf Raise",
            link: "https://www.youtube.com/watch?v=0Fzgo2Votrc",
            type: "timer",
            complete: false
          },
          {
            title: "One Arm Left Dumbell Lateral Raise",
            link: "https://www.youtube.com/watch?v=JdDf5rIP5Ss",
            type: "timer",
            complete: false
          },
          {
            title: "One Arm Right Dumbell Lateral Raise",
            link: "https://www.youtube.com/watch?v=JdDf5rIP5Ss",
            type: "timer",
            complete: false
          },
          {
            title: "Knee Circle",
            link: "https://www.youtube.com/watch?v=cYDkPDqeY5E",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Shrug",
            link: "https://www.youtube.com/watch?v=IuMXYFCVIdA",
            type: "timer",
            complete: false
          },
          {
            title: "Bulgarian Split Squat Left",
            link: "https://www.youtube.com/watch?v=OUnSPY8KLfE",
            type: "timer",
            complete: false
          },
          {
            title: "Bulgarian Split Squat Right",
            link: "https://www.youtube.com/watch?v=OUnSPY8KLfE",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Step-Up On To Chair",
            link: "https://www.youtube.com/watch?v=LBE_p-h_XhA",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Jumping Squat",
            link: "https://www.youtube.com/watch?v=WXnXU-KgKVI",
            type: "timer",
            complete: false
          },
          {
            title: "Single Leg Drops",
            link: "https://www.youtube.com/watch?v=Qh5OdDUHzBo",
            type: "timer",
            complete: false
          },
          {
            title: "Chair Bicycle Crunch",
            link: "https://www.youtube.com/watch?v=1xEZ1So_D-A",
            type: "timer",
            complete: false
          },
          {
            title: "Standing Dumbell Calf Raise",
            link: "https://www.youtube.com/watch?v=jlDvVeOcP5M",
            type: "timer",
            complete: false
          },
          {
            title: "Bent Knee Left Side Hip Raises",
            link: "https://www.youtube.com/watch?v=4tWQ2PrE8pw",
            type: "timer",
            complete: false
          },
          {
            title: "Bent Knee Right Side Hip Raises",
            link: "https://www.youtube.com/watch?v=4tWQ2PrE8pw",
            type: "timer",
            complete: false
          },
          {
            title: "Double Leg Circles",
            link: "https://www.youtube.com/watch?v=0OxxUdSEFqA",
            type: "timer",
            complete: false
          },
          {
            title: "Chair Squats",
            link: "https://www.youtube.com/watch?v=hpuSq5vv4Gc",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Lunges",
            link: "https://www.youtube.com/watch?v=yIc1YbVLMZ8",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Squats",
            link: "https://www.youtube.com/watch?v=qkm3etbZu74",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Jumping Lunge",
            link: "https://www.youtube.com/watch?v=B0_E6hzVaDE",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Swing",
            link: "https://www.youtube.com/watch?v=ELSro-2v_Sw",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Squat Clean & Press",
            link: "https://www.youtube.com/watch?v=vIt0SeDcAug",
            type: "timer",
            complete: false
          },
          {
            title: "Left Tricep Dumbell Flick Back",
            link: "https://www.youtube.com/watch?v=A1XWkJLwAI0",
            type: "timer",
            complete: false
          },
          {
            title: "Right Tricep Dumbell Flick Back",
            link: "https://www.youtube.com/watch?v=A1XWkJLwAI0",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Hip Thrust",
            link: "https://www.youtube.com/watch?v=VcVATdt9Mfc",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Backward Lunge",
            link: "https://www.youtube.com/watch?v=h1yTq_upObI",
            type: "timer",
            complete: false
          },
          {
            title: "Wood Chops",
            link: "https://www.youtube.com/watch?v=Ax_94gEavYo",
            type: "timer",
            complete: false
          },
          {
            title: "Double Leg Circles",
            link: "https://www.youtube.com/watch?v=E1yzpXKbUH4",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Butt Bridge",
            link: "https://www.youtube.com/watch?v=6gGzYaD9Cb4",
            type: "timer",
            complete: false
          },
          {
            title: "Bicep Curls",
            link: "https://www.youtube.com/watch?v=IeQOUoU-kDw",
            type: "timer",
            complete: false
          },
          {
            title: "Pilates Leg Pulls",
            link: "https://www.youtube.com/watch?v=DV3AN2_OOU8",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Hip Bridge & Left Leg Lift",
            link: "https://www.youtube.com/watch?v=o_g6vKfkREI",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Hip Bridge & Right Leg Lift",
            link: "https://www.youtube.com/watch?v=o_g6vKfkREI",
            type: "timer",
            complete: false
          },
          {
            title: "Marchin Hip Raises",
            link: "https://www.youtube.com/watch?v=lD8TZAPjfLk",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Single Leg Left Deadlift",
            link: "https://www.youtube.com/watch?v=gBPbL3AxzzE",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Single Leg Right Deadlift",
            link: "https://www.youtube.com/watch?v=gBPbL3AxzzE",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Split Squat Left",
            link: "https://www.youtube.com/watch?v=5M1k1Hn_dO8",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Split Squat Right",
            link: "https://www.youtube.com/watch?v=5M1k1Hn_dO8",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Single Arm Left Fly",
            link: "https://www.youtube.com/watch?v=VzahmWiMbLI",
            type: "timer",
            complete: false
          },
          {
            title: "Dumbell Single Arm Right Fly",
            link: "https://www.youtube.com/watch?v=VzahmWiMbLI",
            type: "timer",
            complete: false
          },
          {
            title: "Kick Crunch",
            link: "https://www.youtube.com/watch?v=ARMq_MaZMq0",
            type: "timer",
            complete: false
          }
        ]
      }
    ]
  }
]
export default initCircuitTracking;