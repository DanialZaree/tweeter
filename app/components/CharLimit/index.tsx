import { useCharLimitStore } from '@/app/store/useCharLimitStore';

interface CharLimitProps {
  charLimit: number;
}

export default function CharLimit({ charLimit }: CharLimitProps) {
  const { character } = useCharLimitStore();

  return(
    <div className='text-white'>
      {character}/{charLimit}
    </div>
  )
}
