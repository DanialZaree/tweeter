import Avatar from '../ui/Avatar';

interface ProfileAvatarWithTierProps {
  name?: string | null;
  image?: string | null;
  tierColor?: string;
  expandable?: boolean;
}

export default function ProfileAvatarWithTier({
  name,
  image,
  tierColor = '#94a3b8',
  expandable = true,
}: ProfileAvatarWithTierProps) {
  return (
    <div className="relative select-none">
      <div
        className="z-10 relative rounded-full outline-[3px] sm:outline-3 outline-offset-[5px] sm:outline-offset-[6px] w-20 sm:w-24 h-20 sm:h-24 overflow-hidden transition-all duration-300"
        style={{
          outlineColor: tierColor,
        }}
      >
        <Avatar name={name} image={image} size={96} expandable={expandable} />
      </div>
    </div>
  );
}
