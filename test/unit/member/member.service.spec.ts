import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Status } from 'src/entities/enum/status.enum';
import { House } from 'src/entities/house.entity';
import { HouseMember } from 'src/entities/houseMember.entity';
import { Invitation } from 'src/entities/invitation.entity';
import { User } from 'src/entities/user.entity';
import { CreateInvitationDto } from 'src/member/dto/create-invitation.dto';
import { EntityNotFoundError, Repository } from 'typeorm';
import { MemberService } from '../../../src/member/member.service';

describe('MemberService', () => {
  let memberService: MemberService;
  let userRepository: Repository<User>;
  let houseRepository: Repository<House>;
  let houseMemberRepository: Repository<HouseMember>;
  let invitationRepository: Repository<Invitation>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(House),
          useValue: {
            findOneByOrFail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(HouseMember),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneByOrFail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Invitation),
          useValue: {
            create: jest.fn().mockReturnValue(new Invitation()),
            save: jest.fn().mockReturnValue(new Invitation()),
          },
        },
      ],
    }).compile();

    memberService = module.get<MemberService>(MemberService);
    houseMemberRepository = module.get<Repository<HouseMember>>(
      getRepositoryToken(HouseMember),
    );
    houseRepository = module.get<Repository<House>>(getRepositoryToken(House));
    invitationRepository = module.get<Repository<Invitation>>(
      getRepositoryToken(Invitation),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(memberService).toBeDefined();
  });

  describe('inviteMember', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const houseId = 1;
      const createInvitationDto: CreateInvitationDto = {
        receiverEmail: 'nonexistinguser@example.com',
      };
      const user: User = { id: 'not-existing' } as any;

      const userRepoFindOneByOrFailSpy = jest.spyOn(
        userRepository,
        'findOneByOrFail',
      );

      userRepoFindOneByOrFailSpy.mockRejectedValue(
        new EntityNotFoundError(User, 'userId'),
      );

      // Act and Assert
      expect(
        await memberService.inviteMember(houseId, createInvitationDto, user),
      ).toBe(
        'EntityNotFoundError: Could not find any entity of type "User" matching: "userId"',
      );
    });

    it('should throw NotAcceptableException if member already exists', async () => {
      // Arrange
      const houseId = 1;
      const createInvitationDto: CreateInvitationDto = {
        receiverEmail: 'test@example.com',
      };
      const user: User = { id: 'already-existing-house-member' } as any;
      const existingMember: HouseMember = { id: 1 } as any;

      const userRepoSpy = jest.spyOn(userRepository, 'findOneByOrFail');
      userRepoSpy.mockResolvedValue(new User());

      const houseRepoSpy = jest.spyOn(houseMemberRepository, 'findOne');
      houseRepoSpy.mockResolvedValue(existingMember);

      // Act and Assert
      expect(
        memberService.inviteMember(houseId, createInvitationDto, user),
      ).resolves.toBe('NotAcceptableException: Already exists member');
    });
  });

  it('should create an invitation if member does not exist and operation is successful', async () => {
    // Arrange
    const houseId = 1;
    const createInvitationDto: CreateInvitationDto = {
      receiverEmail: 'nonexistingmember@example.com',
    };
    const user: User = { id: 'uuid' } as any;

    const userRepoSpy = jest.spyOn(userRepository, 'findOneByOrFail');
    const houseMemberRepoSpy = jest.spyOn(houseMemberRepository, 'findOne');

    userRepoSpy.mockResolvedValue(new User());
    houseMemberRepoSpy.mockResolvedValue(null);

    // Act
    const result = await memberService.inviteMember(
      houseId,
      createInvitationDto,
      user,
    );

    // Assert
    expect(result).toBeInstanceOf(Invitation);
    expect(invitationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        senderUserId: user.id,
        houseId,
        status: Status.Pending,
      }),
    );
    expect(invitationRepository.save).toHaveBeenCalledWith(
      expect.any(Invitation),
    );
  });
});
