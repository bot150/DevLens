import React from "react"
import {
  IoHomeOutline,
  IoScanOutline,
  IoCodeSlashOutline,
  IoBugOutline,
} from "react-icons/io5"

export type PairCheckScreen =
  | "home"
  | "devlens"
  | "review"
  | "analysis"

type GradientMenuProps = {
  activeScreen: PairCheckScreen
  onNavigate: (screen: PairCheckScreen) => void
  hasAnalysis?: boolean
}

const menuItems = [
  {
    title: "Home",
    screen: "home" as PairCheckScreen,
    icon: <IoHomeOutline />,
    gradientFrom: "#7A1F3D",
    gradientTo: "#A83B5B",
  },
  {
    title: "DevLens",
    screen: "devlens" as PairCheckScreen,
    icon: <IoScanOutline />,
    gradientFrom: "#651832",
    gradientTo: "#A83B5B",
  },
  {
    title: "Review",
    screen: "review" as PairCheckScreen,
    icon: <IoCodeSlashOutline />,
    gradientFrom: "#7A1F3D",
    gradientTo: "#B14A69",
  },
  {
    title: "Results",
    screen: "analysis" as PairCheckScreen,
    icon: <IoBugOutline />,
    gradientFrom: "#4A1025",
    gradientTo: "#7A1F3D",
  },
]

export default function GradientMenu({
  activeScreen,
  onNavigate,
  hasAnalysis = false,
}: GradientMenuProps) {
  return (
    <nav
      className="
        fixed
        bottom-4
        left-1/2
        -translate-x-1/2
        z-50
        w-[calc(100%-24px)]
        max-w-md
      "
    >
      <div
        className="
          rounded-[22px]
          border
          border-[#DCCFC5]
          bg-[#FFFDF9]/95
          backdrop-blur-xl
          shadow-[0_12px_40px_rgba(74,16,37,0.14)]
          px-2
          py-2
        "
      >
        <ul className="flex items-center justify-between gap-1">
          {menuItems.map(
            ({
              title,
              screen,
              icon,
              gradientFrom,
              gradientTo,
            }) => {
              const isActive = activeScreen === screen

              const disabled =
                screen === "analysis" && !hasAnalysis

              return (
                <li key={screen} className="flex-1">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) {
                        onNavigate(screen)
                      }
                    }}
                    aria-label={title}
                    aria-current={isActive ? "page" : undefined}
                    className={`
                      relative
                      w-full
                      h-[52px]
                      rounded-[17px]
                      flex
                      items-center
                      justify-center
                      overflow-hidden
                      transition-all
                      duration-300
                      group
                      ${
                        disabled
                          ? "opacity-35 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                    style={
                      {
                        "--gradient-from": gradientFrom,
                        "--gradient-to": gradientTo,
                      } as React.CSSProperties
                    }
                  >
                    {/* Active gradient background */}
                    <span
                      className={`
                        absolute
                        inset-0
                        rounded-[17px]
                        bg-[linear-gradient(135deg,var(--gradient-from),var(--gradient-to))]
                        transition-all
                        duration-300
                        ${
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-10"
                        }
                      `}
                    />

                    {/* Soft glow */}
                    <span
                      className={`
                        absolute
                        inset-1
                        rounded-[15px]
                        bg-[linear-gradient(135deg,var(--gradient-from),var(--gradient-to))]
                        blur-[12px]
                        transition-all
                        duration-300
                        ${
                          isActive
                            ? "opacity-20"
                            : "opacity-0 group-hover:opacity-10"
                        }
                      `}
                    />

                    {/* Content */}
                    <span
                      className={`
                        relative
                        z-10
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition-all
                        duration-300
                        ${
                          isActive
                            ? "text-white"
                            : "text-[#74686B]"
                        }
                      `}
                    >
                      <span
                        className={`
                          text-[21px]
                          transition-transform
                          duration-300
                          ${
                            isActive
                              ? "scale-100"
                              : "group-hover:scale-110"
                          }
                        `}
                      >
                        {icon}
                      </span>

                      <span
                        className={`
                          text-xs
                          font-semibold
                          tracking-wide
                          whitespace-nowrap
                          transition-all
                          duration-300
                          ${
                            isActive
                              ? "max-w-[80px] opacity-100"
                              : "max-w-0 opacity-0"
                          }
                        `}
                      >
                        {title}
                      </span>
                    </span>
                  </button>
                </li>
              )
            }
          )}
        </ul>
      </div>
    </nav>
  )
}