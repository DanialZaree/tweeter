import { useCharLimitStore } from '@/app/store/useCharLimitStore';

interface CharLimitProps {
  charLimit: number;
}

export default function CharLimit({ charLimit }: CharLimitProps) {
  const { character, updateChar } = useCharLimitStore();

  return(
    <div className='text-white'>
      {charLimit}/{character}
    </div>
  )
}
