import Avatar from '../ui/Avatar';

interface ProfileAvatarWithTierProps {
  name?: string | null;
  image?: string | null;
  tierColor?: string;
}

export default function ProfileAvatarWithTier({
  name,
  image,
  tierColor = '#94a3b8',
}: ProfileAvatarWithTierProps) {
  return (
    <div className="relative select-none">
      <div
        className="z-10 relative rounded-full outline-[3.5px] sm:outline-4 outline-offset-[7px] sm:outline-offset-[8px] w-20 sm:w-24 h-20 sm:h-24 overflow-hidden transition-all duration-300"
        style={{
          outlineColor: tierColor,
        }}
      >
        <Avatar name={name} image={image} size={96} expandable={false} />
      </div>
    </div>
  );
}
